# 🏫 Smart Campus Operations Hub

A full-stack web application for managing smart campus operations, built as a university group project for **IT3030 — Platform-based Application Framework (PAF)**.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Response Format](#-api-response-format)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Team Workflow](#-team-workflow)

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Java 21, Spring Boot 3.4          |
| Frontend   | React 19, Vite, TailwindCSS v4    |
| Database   | MongoDB                           |
| CI/CD      | GitHub Actions                    |

---

## ✅ Prerequisites

Make sure you have the following installed on your machine:

- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **MongoDB 7+** — [Download](https://www.mongodb.com/try/download/community)
- **Git** — [Download](https://git-scm.com/)

---

## 📁 Project Structure

```
it3030-paf-2026-smart-campus-group04/
├── .github/
│   └── workflows/
│       └── build-and-test.yml      # CI/CD pipeline
├── backend/
│   ├── pom.xml                     # Maven dependencies
│   └── src/
│       ├── main/
│       │   ├── java/com/smartcampus/
│       │   │   ├── config/         # Security, CORS, etc.
│       │   │   ├── controller/     # REST controllers
│       │   │   ├── dto/            # Data transfer objects
│       │   │   ├── exception/      # Global error handling
│       │   │   ├── model/          # MongoDB documents
│       │   │   ├── repository/     # Data access layer
│       │   │   └── service/        # Business logic
│       │   └── resources/
│       │       └── application.yml # App configuration
│       └── test/                   # Unit & integration tests
├── frontend/
│   ├── package.json
│   ├── vite.config.js              # Vite + TailwindCSS config
│   └── src/
│       ├── assets/                 # Images, icons, fonts
│       ├── components/             # Reusable UI components
│       ├── context/                # React Context providers
│       ├── pages/                  # Page-level components
│       ├── services/               # API service layer (Axios)
│       ├── utils/                  # Helper functions
│       ├── App.jsx                 # Root component + routes
│       └── main.jsx                # Entry point
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/it3030-paf-2026-smart-campus-group04.git
cd it3030-paf-2026-smart-campus-group04
```

### 2. Start MongoDB

Make sure MongoDB is running locally on port `27017`. The app will connect to a database named `smart_campus_db` (created automatically).

```bash
mongod
```

### 3. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at: **http://localhost:8080/api**

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at: **http://localhost:5173**

> **Note:** The Vite dev server is configured to proxy `/api` requests to the backend, so you don't need to worry about CORS during development.

---

## 📦 API Response Format

All API endpoints return a uniform JSON response using the `ApiResponse<T>` wrapper:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... },
  "timestamp": "2026-02-26T10:00:00"
}
```

**Error example:**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email is required",
    "name": "Name must be at least 2 characters"
  },
  "timestamp": "2026-02-26T10:00:00"
}
```

---

## ⚙️ CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration. On every push or pull request to `main`:

| Job       | Steps                                    |
|-----------|------------------------------------------|
| Backend   | Checkout → Setup JDK 21 → `mvn clean test` |
| Frontend  | Checkout → Setup Node 20 → `npm ci` → `npm run build` |

The workflow file is located at `.github/workflows/build-and-test.yml`.

---

## 👥 Team Workflow

### Branching Strategy

1. **Never push directly to `main`**
2. Create a feature branch: `git checkout -b feature/your-module-name`
3. Make your changes and commit
4. Push and open a Pull Request to `main`
5. Wait for CI checks to pass ✅
6. Get at least 1 code review approval
7. Merge via **Squash and Merge**

### Module Development

Each team member works in their own package/directory:

- **Backend:** Create your controller, service, repository, and model classes inside their respective packages under `com.smartcampus.*`
- **Frontend:** Create your pages in `src/pages/`, components in `src/components/`, and API calls in `src/services/`

---

## 📝 License

This project is developed for academic purposes as part of the IT3030 module at SLIIT.
