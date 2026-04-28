# 🏫 Smart Campus Operations Hub

A comprehensive full-stack web application for managing smart campus operations — built as a university group project for **IT3030 — Platform-based Application Framework (PAF)**.

**Group:** 04

| Member | Role | Modules |
|--------|------|---------|
| [Your Full Name] | Group Leader (Member 1) | Authentication & Authorization, Maintenance Ticketing, AI Chatbot & Recommendations, Lost & Found, Campus Map, UI Layout |
| [Member 2 Full Name] | Member 2 | Facility Booking, QR Code Check-In/Out, Attendance Management, Role-Based Dashboards |
| [Member 3 Full Name] | Member 3 | Facilities & Assets Catalogue, Real-Time Shuttle Tracking |
| [Member 4 Full Name] | Member 4 | Event Management, Real-Time Notifications, System Maintenance Mode |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.4, Spring Security, Spring Data MongoDB |
| **Frontend** | React 19, Vite 6.2, TailwindCSS v4, React Router v7 |
| **Database** | MongoDB (Atlas / Local) |
| **Authentication** | Google OAuth 2.0 + JWT (HMAC-SHA256) |
| **AI** | Google Gemini AI (gemini-2.0-flash-lite) |
| **Maps** | Google Maps JavaScript API |
| **Real-Time** | WebSocket (STOMP over SockJS) |
| **CI/CD** | GitHub Actions |

---

## ✅ Prerequisites

Make sure you have the following installed:

- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

> **Note:** MongoDB Atlas (cloud) is used by default. No local MongoDB installation is required unless you change the connection URI.

---

## 📁 Project Structure

```
it3030-paf-2026-smart-campus-group04/
├── .github/
│   └── workflows/
│       └── build-and-test.yml         # CI/CD pipeline
├── backend/
│   ├── pom.xml                        # Maven dependencies
│   ├── .env                           # Backend environment variables (create this)
│   └── src/
│       ├── main/
│       │   ├── java/com/smartcampus/
│       │   │   ├── config/            # Security, CORS, WebSocket, JWT config
│       │   │   ├── controller/        # 16 REST controllers
│       │   │   ├── dto/               # 36 Data Transfer Objects
│       │   │   ├── exception/         # Global exception handler
│       │   │   ├── model/             # 33 MongoDB document models & enums
│       │   │   ├── repository/        # 13 Spring Data MongoDB repositories
│       │   │   └── service/           # 15 Business logic services
│       │   └── resources/
│       │       └── application.yml    # Spring Boot configuration
│       └── test/                      # Unit & integration tests
├── frontend/
│   ├── package.json                   # npm dependencies
│   ├── .env                           # Frontend environment variables (create this)
│   ├── vite.config.js                 # Vite + TailwindCSS config
│   └── src/
│       ├── assets/                    # Images, icons
│       ├── components/                # 10 reusable UI components
│       ├── context/                   # AuthContext (global auth state)
│       ├── pages/                     # 40+ page components
│       ├── services/                  # 12 Axios API service modules
│       ├── App.jsx                    # Root component + route definitions
│       └── main.jsx                   # Application entry point
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/[username]/it3030-paf-2026-smart-campus-group04.git
cd it3030-paf-2026-smart-campus-group04
```

### Step 2: Configure Backend Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
cd backend
```

Create the file `backend/.env` with the following content:

```env
# ──────────────────────────────────────────────
# Smart Campus Backend — Environment Variables
# ──────────────────────────────────────────────

# MongoDB Connection URI (Atlas or Local)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_campus_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=<your-jwt-secret-key-min-32-characters>
JWT_EXPIRATION=86400000

# Google OAuth 2.0 Client ID
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com

# Google Gemini AI API Keys
# Get from: https://aistudio.google.com/apikey
GEMINI_CHATBOT_API_KEY=<your-gemini-api-key>
GEMINI_RECOMMENDATION_API_KEY=<your-gemini-api-key>
```

### Step 3: Configure Frontend Environment Variables

Create a `.env` file inside the `frontend/` directory:

```bash
cd ../frontend
```

Create the file `frontend/.env` with the following content:

```env
# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com

# ImgBB API Key (for image uploads)
VITE_IMGBB_API_KEY=<your-imgbb-api-key>

# Google Maps API Key (for shuttle tracking)
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

### Step 4: Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at: **http://localhost:8082/api**

### Step 5: Run the Frontend

Open a **new terminal** window:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at: **http://localhost:5173**

### Step 6: Access the Application

1. Open **http://localhost:5173** in your browser
2. Click **"Sign in with Google"** to authenticate
3. After first login, your default role is `USER`
4. To access admin features, manually update the user's `role` field in MongoDB to `ADMIN`

---

## 🔑 Environment Variables Summary

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) | ✅ Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars) | ✅ Yes |
| `JWT_EXPIRATION` | Token expiry time in milliseconds (default: 86400000 = 24hrs) | ✅ Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID for token verification | ✅ Yes |
| `GEMINI_CHATBOT_API_KEY` | Google Gemini API key for the AI chatbot | ✅ Yes |
| `GEMINI_RECOMMENDATION_API_KEY` | Google Gemini API key for smart recommendations | ✅ Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID (same as backend) | ✅ Yes |
| `VITE_IMGBB_API_KEY` | ImgBB API key for image uploads in tickets/facilities | ✅ Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for shuttle tracking map | ✅ Yes |

> ⚠️ **Important:** Never commit `.env` files to version control. They are excluded via `.gitignore`.

---

## 📦 API Response Format

All API endpoints return a uniform JSON response using the `ApiResponse<T>` wrapper:

**Success:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": { ... },
  "timestamp": "2026-04-28T10:00:00"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email is required"
  },
  "timestamp": "2026-04-28T10:00:00"
}
```

---

## 📂 System Modules

| # | Module | Member | Backend | Frontend |
|---|--------|--------|---------|----------|
| 1 | Authentication & Authorization | Member 1 | `AuthController`, `JwtTokenProvider`, `SecurityConfig` | `Login.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx` |
| 2 | Maintenance & Incident Ticketing | Member 1 | `TicketController` (12 endpoints) | `CreateTicket.jsx`, `MyTickets.jsx`, `TicketDetail.jsx`, `ManageTickets.jsx` |
| 3 | AI Chatbot & Recommendations | Member 1 | `ChatbotController`, `RecommendationController` | `ChatBot.jsx`, `SmartRecommendations.jsx` |
| 4 | Lost & Found Management | Member 1 | `LostFoundController` (6 endpoints) | `LostFound.jsx`, `ReportLostFound.jsx`, `ManageLostFound.jsx` |
| 5 | Interactive Campus Map | Member 1 | — (uses Facility data) | `CampusMap.jsx` (custom SVG map) |
| 6 | UI Layout (Navbar, Footer, Home, About, Contact) | Member 1 | — | `Navbar.jsx`, `Footer.jsx`, `Home.jsx`, `AboutUs.jsx`, `Contact.jsx` |
| 7 | Facility Booking Management | Member 2 | `BookingController` (10 endpoints) | `BookingForm.jsx`, `MyBookings.jsx`, `ManageBookings.jsx` |
| 8 | QR Code Check-In/Out & Attendance | Member 2 | `AttendanceController` (6 endpoints) | `ScanAttendance.jsx`, `ManageAttendance.jsx` |
| 9 | Role-Based Dashboards | Member 2 | — (aggregates data) | `Dashboard.jsx`, `ManagerDashboard.jsx`, `TechnicianDashboard.jsx` |
| 10 | Facilities & Assets Catalogue | Member 3 | `FacilityController` (5 endpoints) | `Facilities.jsx`, `FacilityDetail.jsx`, `ManageFacilities.jsx` |
| 11 | Real-Time Shuttle Tracking | Member 3 | `ShuttleController`, `RouteController` | `TransportMap.jsx`, `DriverTracking.jsx`, `ManageTransport.jsx` |
| 12 | Event Management | Member 4 | `EventController` (9 endpoints) | `Events.jsx`, `EventDetail.jsx`, `EventCalendarPage.jsx`, `ManageEvents.jsx` |
| 13 | Real-Time Notifications | Member 4 | `NotificationController`, `WebSocketConfig` | `NotificationBell.jsx`, `NotificationDropdown.jsx` |
| 14 | System Maintenance Mode | Member 4 | `MaintenanceController`, `MaintenanceInterceptor` | `AdminMaintenance.jsx`, `MaintenanceBanner.jsx`, `Maintenance.jsx` |

---

## ⚙️ CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration. On every push or pull request to `main`:

| Job | Steps |
|-----|-------|
| **Backend** | Checkout → Setup JDK 21 → `mvn clean test` |
| **Frontend** | Checkout → Setup Node 20 → `npm ci` → `npm run build` |

Config file: `.github/workflows/build-and-test.yml`

---

## 📝 License

This project is developed for academic purposes as part of the IT3030 module at SLIIT.
