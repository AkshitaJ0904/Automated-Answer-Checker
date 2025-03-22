from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
import pymongo
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from flask_cors import cross_origin

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017/?directConnection=true"
client = pymongo.MongoClient(MONGO_URI)
db = client["mydatabase"]
users_collection = db["users"]
assessments_collection = db["assessments"]

# Secret key for JWT authentication
app.config["JWT_SECRET_KEY"] = "your_secret_key"

# Ensure the uploads directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Helper function to save files
def save_file(file):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    return file_path

# Helper function to calculate marks
def calculate_marks(student_answer_path):
    # Mock implementation - replace with actual logic
    return 85

# Signup endpoint
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    users_collection.insert_one({"email": email, "password": hashed_password})
    return jsonify({"message": "User registered successfully"}), 201

# Login endpoint
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    user = users_collection.find_one({"email": email})
    if user and bcrypt.check_password_hash(user["password"], password):
        access_token = create_access_token(identity=email)
        return jsonify({"token": access_token}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# Dashboard endpoint (create assessment)
@app.route("/dashboard", methods=["POST"])
def dashboard():
    if 'teacherQuestionPaper' not in request.files or 'teacherAnswerSheet' not in request.files:
        return jsonify({"error": "Missing file(s)"}), 400

    teacher_question_paper = request.files['teacherQuestionPaper']
    teacher_answer_sheet = request.files['teacherAnswerSheet']
    assessment_name = request.form.get('assessmentName')

    teacher_question_path = save_file(teacher_question_paper)
    teacher_answer_path = save_file(teacher_answer_sheet)

    assessment_data = {
        "assessmentName": assessment_name,
        "teacherQuestionPaper": teacher_question_path,
        "teacherAnswerSheet": teacher_answer_path,
        "studentAnswerSheets": [],
        "questions": [],
    }
    result = assessments_collection.insert_one(assessment_data)

    return jsonify({
        "message": "Assessment created successfully",
        "assessmentId": str(result.inserted_id),
    }), 201

@app.route("/assessments", methods=["GET"])
def get_assessments():
    try:
        assessments = list(assessments_collection.find({}))
        for assessment in assessments:
            assessment["_id"] = str(assessment["_id"])  # Convert ObjectId to string
        return jsonify(assessments), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

# Endpoint to upload multiple student answer sheets
@app.route("/upload-student-answers", methods=["POST"])
def upload_student_answers():
    try:
        if 'answerFiles[]' not in request.files:
            return jsonify({"error": "No student answer sheets uploaded"}), 400

        answer_files = request.files.getlist("answerFiles[]")
        candidate_keys = request.form.getlist("candidateKeys[]")
        assessment_id = request.form.get("assessmentId")

        if not answer_files or not candidate_keys or not assessment_id:
            return jsonify({"error": "Missing student data or assessment ID"}), 400

        if len(answer_files) != len(candidate_keys):
            return jsonify({"error": "Mismatch between candidate keys and answer files"}), 400

        if not ObjectId.is_valid(assessment_id):
            return jsonify({"error": "Invalid assessment ID"}), 400

        assessment = assessments_collection.find_one({"_id": ObjectId(assessment_id)})
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        results = []
        for answer_file, candidate_key in zip(answer_files, candidate_keys):
            try:
                answer_file_path = save_file(answer_file)
                total_marks = calculate_marks(answer_file_path)

                student_data = {
                    "candidateKey": candidate_key,
                    "answerSheetPath": answer_file_path,
                    "totalMarks": total_marks
                }

                update_result = assessments_collection.update_one(
                    {"_id": ObjectId(assessment_id)},
                    {"$push": {"studentAnswerSheets": student_data}}
                )

                if update_result.matched_count == 0:
                    return jsonify({"error": "Failed to update assessment"}), 500

                results.append({
                    "candidateKey": candidate_key,
                    "totalMarks": total_marks
                })

            except Exception as e:
                print(f"Error processing file {answer_file.filename}: {e}")
                return jsonify({"error": f"Failed to process file {answer_file.filename}"}), 500

        return jsonify({
            "message": "Student answer sheets uploaded successfully",
            "results": results
        }), 201

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Endpoint to fetch assessment data
@app.route("/api/assessments/<assessment_id>", methods=["GET"])
def get_assessment(assessment_id):
    try:
        assessment = assessments_collection.find_one({"_id": ObjectId(assessment_id)})
        if assessment:
            assessment["_id"] = str(assessment["_id"])
            return jsonify(assessment), 200
        else:
            return jsonify({"message": "Assessment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Endpoint to serve uploaded files
@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_pdf(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/assessments", methods=["POST", "OPTIONS"])
def create_assessment():
    if request.method == "OPTIONS":
        # Handle preflight request
        return jsonify({"message": "Preflight request successful"}), 200

    if 'teacherQuestionPaper' not in request.files or 'teacherAnswerSheet' not in request.files:
        return jsonify({"error": "Missing file(s)"}), 400

    teacher_question_paper = request.files['teacherQuestionPaper']
    teacher_answer_sheet = request.files['teacherAnswerSheet']
    assessment_name = request.form.get('assessmentName')

    teacher_question_path = save_file(teacher_question_paper)
    teacher_answer_path = save_file(teacher_answer_sheet)

    assessment_data = {
        "assessmentName": assessment_name,
        "teacherQuestionPaper": teacher_question_path,
        "teacherAnswerSheet": teacher_answer_path,
        "studentAnswerSheets": [],
        "questions": [],
    }
    result = assessments_collection.insert_one(assessment_data)

    return jsonify({
        "message": "Assessment created successfully",
        "assessmentId": str(result.inserted_id),
    }), 201

# @app.route("/api/assessments/<assessment_id>/students/<candidate_key>", methods=["GET"])
# def get_student_marks(assessment_id, candidate_key):
#     try:
#         assessment = assessments_collection.find_one({"_id": ObjectId(assessment_id)})
#         if assessment:
#             student_answer = next(
#                 (answer for answer in assessment.get("studentAnswerSheets", []) 
#                  if answer.get("candidateKey") == candidate_key),
#                 None
#             )
#             if student_answer:
#                 return jsonify({
#                     "candidateKey": student_answer.get("candidateKey"),
#                     "totalMarks": student_answer.get("totalMarks"),
#                     "answerSheetPath": student_answer.get("answerSheetPath")
#                 }), 200
#             else:
#                 return jsonify({"error": "Candidate key not found"}), 404
#         else:
#             return jsonify({"error": "Assessment not found"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/api/assessments/<assessment_id>/students/<candidate_key>/evaluation", methods=["GET"])
# def get_student_evaluation(assessment_id, candidate_key):
#     try:
#         # Fetch the assessment
#         assessment = assessments_collection.find_one({"_id": ObjectId(assessment_id)})
#         if not assessment:
#             return jsonify({"error": "Assessment not found"}), 404

#         # Find the student's answer sheet
#         student_data = next(
#             (student for student in assessment.get("studentAnswerSheets", [])
#              if student.get("candidateKey") == candidate_key),
#             None
#         )

#         if not student_data:
#             return jsonify({"error": "Student data not found"}), 404

#         # Prepare the response data
#         response_data = {
#             "assessmentName": assessment.get("assessmentName"),
#             "studentAnswerSheet": {
#                 "url": f"/uploads/{os.path.basename(student_data.get('answerSheetPath', ''))}"
#             },
#             "questions": assessment.get("questions", []),
#             "total_marks": student_data.get("totalMarks", 0),
#             "awarded_marks": student_data.get("awarded_marks", {})
#         }

#         return jsonify(response_data), 200

#     except Exception as e:
#         print(f"Error in get_student_evaluation: {str(e)}")
#         return jsonify({"error": str(e)}), 500


@app.route("/api/assessments/<assessment_id>/students/<candidate_key>/evaluation", methods=["GET"])
def get_student_evaluation(assessment_id, candidate_key):
    try:
        # Fetch the assessment
        assessment = assessments_collection.find_one({
            "_id": ObjectId(assessment_id),
            "candidate_id": candidate_key
        })
        
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        # Prepare the response data
        response_data = {
            "assessmentName": assessment.get("exam_name", ""),
            "studentAnswerSheet": {
                "url": f"/uploads/{candidate_key}_answer_sheet.pdf"  # Assuming this naming convention
            },
            "questions": assessment.get("questions", []),
            "total_marks": assessment.get("total_marks", 0)
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error in get_student_evaluation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/assessments/<assessment_id>/students/<candidate_key>/evaluation", methods=["PUT"])
def update_student_evaluation(assessment_id, candidate_key):
    try:
        data = request.json
        if not data or "questions" not in data:
            return jsonify({"error": "Invalid request data"}), 400

        # Calculate total marks from the updated questions
        total_marks = sum(q.get("awarded_marks", 0) for q in data["questions"])

        # Update the assessment with new marks
        result = assessments_collection.update_one(
            {
                "_id": ObjectId(assessment_id),
                "candidate_id": candidate_key
            },
            {
                "$set": {
                    "questions": data["questions"],
                    "total_marks": total_marks
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({"error": "Assessment or student not found"}), 404

        return jsonify({
            "message": "Evaluation updated successfully",
            "total_marks": total_marks
        }), 200

    except Exception as e:
        print(f"Error in update_student_evaluation: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    # Add this endpoint to fetch all student data for an assessment
# @app.route("/api/assessments/<assessment_id>/students", methods=["GET"])
# def get_all_students(assessment_id):
#     try:
#         assessment = assessments_collection.find_one({"_id": ObjectId(assessment_id)})
#         if assessment:
#             students = assessment.get("studentAnswerSheets", [])
#             return jsonify(students), 200
#         else:
#             return jsonify({"error": "Assessment not found"}), 404
#     except Exception as e:
        # return jsonify({"error": str(e)}), 5003
    
    
    
if __name__ == "__main__":
    app.run(debug=True)