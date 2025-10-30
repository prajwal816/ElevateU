# ElevateU - A Modern Learning Management System

ElevateU is a modern LMS for teachers and students to manage courses, share resources, and track progress through a clean, responsive interface.

This project is built with a **microservice architecture**, completely containerized with Docker, making it scalable, modular, and easy to deploy.

## ✨ Core Features

* **Course & Resource Management:** Teachers can create courses, upload materials, and manage student enrollment.
* **Student Progress Tracking:** A centralized system for students and teachers to track grades and assignment submissions.
* **ML Plagiarism Service:** An integrated Python-based microservice to check text-based submissions for plagiarism.
* **Modern Responsive UI:** A clean, fast, and responsive user interface built with React, TypeScript, and Tailwind CSS.
* **Containerized Environment:** The entire application stack (frontend, backend, ML service, and database) is managed with Docker and Docker Compose.

---

## 🏛️ Architecture & Tech Stack

The application is split into three main, independent services and a database:

| Service | Technology | Purpose |
| :--- | :--- | :--- |
| **`frontend`** | React, TypeScript, Vite, Tailwind CSS, Nginx | Provides the client-facing user interface. |
| **`backend`** | Node.js (Express.js), JavaScript | The main API server for business logic, user auth, and course data. |
| **`ml-service`** | Python (Flask/FastAPI) | A dedicated microservice providing AI/ML models, starting with plagiarism detection. |
| **`Database`** | MongoDB | The primary database for storing all application data. |
| **`DevOps`** | Docker, Docker Compose | Used to containerize and orchestrate all services for development and production. |

---

## 📁 Project Structure

The repository is a monorepo containing all the services:

ElevateU/
├── 📁 backend/ # Node.js backend API (controllers, models, routes)
│ ├── server.js
│ └── Dockerfile
│
├── 📁 frontend/ # React + Vite frontend application
│ ├── src/
│ ├── Dockerfile
│ ├── nginx.conf
│ └── vite.config.ts
│
├── 📁 ml-service/ # Python service for plagiarism detection
│ ├── plagiarism/
│ ├── app.py
│ ├── Dockerfile
│ └── requirements.txt
│
├── 📁 mongo-init/ # Initialization scripts for MongoDB
│
├── 📄 docker-compose.dev.yml # Docker Compose for development (with hot-reloading)
├── 📄 docker-compose.yml # Docker Compose for production
├── 📄 .gitignore
└── 📄 README.md


---

## 🚀 Getting Started

To get a local copy up and running, you must have **Docker** and **Docker Compose** installed.

### 1. Clone the Repository

```bash
git clone [https://github.com/prajwal816/ElevateU.git](https://github.com/prajwal816/ElevateU.git)
cd ElevateU
