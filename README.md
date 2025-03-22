Automated Answer Checking System

This project contains a Machine Learning-powered automated answer evaluation system that extracts and assesses student responses against a given question paper using OCR, NLP, and AI-based marking techniques.

✨ Features
🔹 Question Paper & Answer Extraction

Extracts question paper structure using OCR.

Extracts teacher's answer sheet using OCR.

Extracts handwritten student responses using Google Vision API and a custom preprocessing model.

🔹 AI-Powered Answer Structuring

Uses OpenAI API to structure extracted answers according to the question paper.

Organizes all parts and sub-parts, ensuring accurate mapping.

Allows teachers to input maximum marks for each section.

🔹 Automated Marking System

Passes structured responses to a custom marking scheme model.

Uses semantic analysis & similarity-based scoring to evaluate answers.

Implements checkpoints for reviewing marking accuracy.

Generates detailed results for students.

🔹 Full-Stack Web Integration

Frontend: React.js

Backend: Flask

Database: MongoDB

This system automates the grading process, reducing manual effort and ensuring fair evaluation.
