# Personal Expense & Income Management Web Application

## Project Overview
A secure, user-friendly web application to record, manage, and analyze personal income and expenses. Users can register, categorize transactions, view summaries and charts, and track financial habits over time.

## Problem Statement
Individuals often fail to track income and expenses accurately, causing poor financial planning. Manual tracking is time-consuming and error-prone. This app provides an easy, secure way to manage personal finances.

## Key Features
- User registration and authentication (JWT or Firebase)
- Add, view, edit, and delete income/expense records
- Category-wise transaction management
- Dashboard with charts and summaries (spending by category, income vs expenses)
- User-specific secure data storage (MongoDB or Firebase)

## Technology Stack
- Frontend: React.js, HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB or Firebase
- Authentication: JSON Web Token (JWT) or Firebase Authentication
- Tools: VS Code, Postman, MongoDB Compass

## Installation & Setup
Prerequisites:
- Node.js (v14+)
- MongoDB (or Firebase account)

Quick start (MongoDB example):
1. Clone the repo:
   git clone <repo-url>
2. Backend:
   cd server
   npm install
   Create a .env file with:
   MONGO_URI=<your-mongo-uri>
   JWT_SECRET=<your-jwt-secret>
   PORT=5000
   npm run dev
3. Frontend:
   cd client
   npm install
   Create a .env file:
   REACT_APP_API_URL=http://localhost:5000/api
   npm start

(If using Firebase, configure the Firebase SDK and update client/server configs.)

## Usage
- Register and login
- Add transactions (select type: income/expense and category)
- View dashboard to see summaries and charts
- Filter transactions by date/category and export data as needed

## Expected Outcome
- Fully functional expense/income management web app
- Secure login and user-specific data
- Accurate calculations and visual summaries

## Justification
This project demonstrates full-stack development skills (frontend, backend, database, auth) and provides a practical tool for personal finance management.

## Project Structure (example)
- /client — React frontend
- /server — Express backend
- /models, /routes, /controllers — backend structure
- /components, /pages — frontend structure

## Contact
For questions or help, open an issue or contact the project maintainer.