# Personal Expense & Income Management Web Application

## Project Overview

This project is an academic submission designed to provide a secure, user-friendly web application for recording, managing, and analyzing personal income and expenses. The application helps individuals overcome poor financial planning by providing an easy, secure way to manage personal finances, replacing time-consuming and error-prone manual tracking.

## Objectives

- To develop a full-stack web application for financial tracking.
- To implement secure user authentication and personalized data storage.
- To provide an interactive dashboard with visual summaries of transactions.
- To learn and apply modern web development technologies including React, Node.js, Express, and MongoDB.

## Key Features

- **User Authentication:** Secure registration and login using JSON Web Tokens (JWT) and bcrypt for password hashing.
- **Transaction Management:** Add, view, edit, and delete detailed income and expense records.
- **Categorization with Emojis:** Categorize transactions using a built-in emoji picker for a customized, visually appealing experience.
- **Interactive Dashboard:** Dynamic charts and summaries (spending by category, income vs. expenses) visualized using Recharts.
- **Data Export:** Export financial records as Excel (XLSX) files for external use or record-keeping.
- **File Uploads:** Support for file/image uploads for receipts or profile pictures (via Multer).
- **Responsive UI:** A modern, mobile-friendly interface built with React and Tailwind CSS v4.

## Technology Stack

### Frontend

- **Framework:** React 19 (built with Vite)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Data Visualization:** Recharts
- **Icons & UI Extras:** React Icons, react-hot-toast, emoji-picker-react

### Backend

- **Environment:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB (using Mongoose)
- **Authentication:** JWT, bcryptjs
- **File Handling:** Multer
- **Data Processing:** SheetJS (xlsx) for exporting records

## Project Structure

```text
Personal-Expense-Income-Management-Web-Application/
│
├── backend/                  # Server-side code
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Business logic for endpoints (Auth, Transactions, etc.)
│   ├── middleware/           # Custom middlewares (Authentication, File Uploads)
│   ├── models/               # Mongoose schemas (User, Transaction, etc.)
│   ├── routes/               # Express API routes
│   ├── uploads/              # Local storage for uploaded files
│   ├── server.js             # Entry point for the Node.js application
│   └── package.json          # Backend dependencies
│
└── frontend/experse-tracker/ # Client-side React application
    ├── public/               # Static assets
    ├── src/                  # React components, pages, context, styles
    ├── vite.config.js        # Vite configuration
    └── package.json          # Frontend dependencies
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas cluster)
- Git (for cloning the repository)

### Steps to Run Locally

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Personal-Expense-Income-Management-Web-Application
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory with the following variables:

   ```env
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-custom-jwt-secret>
   PORT=5000
   ```

   Start the backend server:

   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal window:
   ```bash
   cd frontend/experse-tracker
   npm install
   ```
   Create a `.env` file in the `frontend/experse-tracker` directory if required, configuring the API URL (e.g., `VITE_API_URL=http://localhost:5000/api`).
   Start the Vite development server:
   ```bash
   npm run dev
   ```

## Expected Academic Outcomes

This project demonstrates the ability to conceptualize, design, and implement a complete MERN stack application from scratch. It showcases practical knowledge in building RESTful APIs, securing applications with JWTs, integrating external libraries for visualization and data formatting, and managing state on the frontend.
