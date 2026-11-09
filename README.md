# WorkSphere

WorkSphere is a modern full-stack enterprise web application foundation built with ASP.NET Core Web API, Entity Framework Core, SQL Server, React, React Router, and Tailwind CSS.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 19 (JSX)
- **Tooling & Bundler:** Vite
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS v4

### Backend
- **Framework:** ASP.NET Core Web API (.NET 10.0)
- **Language:** C# 13
- **ORM:** Entity Framework Core 10
- **Database:** Microsoft SQL Server

---

## 2. Solution Structure

```text
WorkSphere/
├── WorkSphere.sln              # Visual Studio / .NET Solution File
├── README.md                   # Solution Documentation & Quick Start Guide
│
├── WorkSphere.Server/          # Backend ASP.NET Core Web API Project
│   ├── Controllers/            # API Controllers handling incoming HTTP requests
│   │   └── HealthController.cs # Health-check endpoint (/api/health)
│   ├── Data/                   # Data access and database configuration
│   │   ├── Context/            # Entity Framework DbContext definitions
│   │   │   └── ApplicationDbContext.cs
│   │   └── Configurations/     # Fluent API entity configurations (IEntityTypeConfiguration)
│   ├── DTOs/                   # Data Transfer Objects for API request/response contracts
│   ├── Entities/               # Domain database entities / models
│   ├── Helpers/                # Utility classes, extension methods, and helpers
│   ├── Interfaces/             # Service and repository contracts / interfaces
│   ├── Middleware/             # Custom ASP.NET Core HTTP pipeline middlewares
│   ├── Repositories/           # Data access repository implementations
│   ├── Services/               # Business logic layer implementations
│   ├── Properties/
│   │   └── launchSettings.json # Launch profiles and environment configuration
│   ├── appsettings.json        # Application configuration & connection strings
│   ├── appsettings.Development.json
│   ├── Program.cs              # Application entry point, DI, middleware & pipeline setup
│   ├── WorkSphere.Server.csproj # C# Project configuration file
│   └── WorkSphere.Server.http  # HTTP request test file for Visual Studio / VS Code
│
└── WorkSphere.Client/          # Frontend React SPA Project
    ├── public/                 # Static assets (favicons, icons)
    ├── src/
    │   ├── assets/             # Images, SVGs, and brand media
    │   ├── components/         # Reusable presentation components
    │   ├── features/           # Feature-sliced domain modules
    │   ├── hooks/              # Custom React hooks
    │   ├── layouts/            # Layout wrappers (MainLayout with header and footer)
    │   │   └── MainLayout.jsx
    │   ├── pages/              # Top-level page views
    │   │   └── HomePage.jsx
    │   ├── routes/             # Client-side routing configuration
    │   │   └── AppRoutes.jsx
    │   ├── services/           # API clients and HTTP communication services
    │   ├── utils/              # Client-side helper functions and formatters
    │   ├── App.jsx             # Root application component with Router provider
    │   ├── index.css           # Global Tailwind CSS stylesheet
    │   └── main.jsx            # Application bootstrap and DOM mounting
    ├── index.html              # Single-page application HTML entry point
    ├── package.json            # NPM dependencies and scripts
    ├── vite.config.js          # Vite configuration with Tailwind CSS & React plugins
    └── WorkSphere.Client.esproj # Visual Studio JavaScript Project configuration file
```

---

## 3. Architecture & Folder Overview

### Backend (`WorkSphere.Server`)
| Folder | Purpose |
| :--- | :--- |
| `Controllers/` | Defines API endpoints, route attributes, and HTTP response handling. Includes `HealthController.cs`. |
| `Services/` | Implements core business logic and orchestrates domain operations. |
| `Interfaces/` | Defines abstractions for services and repositories to support dependency injection and testability. |
| `Repositories/` | Implements data access patterns, encapsulating queries against the database. |
| `DTOs/` | Defines data transfer contracts for request payloads and response bodies, decoupling API from database schema. |
| `Entities/` | Represents relational database tables and core domain entities. |
| `Data/Context/` | Houses `ApplicationDbContext`, configuring SQL Server connection and model scanning. |
| `Data/Configurations/` | Houses entity-specific EF Core configurations implementing `IEntityTypeConfiguration<T>`. |
| `Middleware/` | Global HTTP exception handlers, logging middlewares, and custom request interceptors. |
| `Helpers/` | Reusable utilities, common constants, and extension methods. |

### Frontend (`WorkSphere.Client`)
| Folder | Purpose |
| :--- | :--- |
| `components/` | Shared, generic UI components (buttons, modals, form inputs, badges). |
| `pages/` | Page-level components corresponding to application routes (e.g., `HomePage.jsx`). |
| `layouts/` | Shell layouts managing persistent UI elements like headers, footers, and sidebars (`MainLayout.jsx`). |
| `features/` | Domain-specific modules grouped by business capability. |
| `services/` | HTTP clients and API service functions for backend communication. |
| `hooks/` | Custom, reusable React hooks for state and side-effect management. |
| `routes/` | Centralized route definitions using React Router (`AppRoutes.jsx`). |
| `utils/` | Formatting, validation, date manipulation, and utility helpers. |
| `assets/` | Static media assets such as logos, icons, and illustrations. |

---

## 4. Getting Started & Running the Application

### Prerequisites
- [.NET SDK 8.0 or 10.0+](https://dotnet.microsoft.com/)
- [Node.js v20+ and npm](https://nodejs.org/)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server) (or LocalDB / SQL Server Express)

---

### Option A: Run Both Projects Concurrently (Recommended)

#### 1. Via PowerShell Script (One Command)
Run the root startup script from the solution directory:
```powershell
.\start-dev.ps1
```
This launches the Vite dev server (`http://localhost:5173`) and ASP.NET Core API server (`http://localhost:5069`), and automatically handles graceful shutdown of both when you press `Ctrl+C`.

#### 2. Via Visual Studio (F5)
1. Open [WorkSphere.sln](WorkSphere.sln) in Visual Studio 2022+.
2. Ensure **WorkSphere.Server** is set as the Startup Project.
3. Choose the **http** or **https** launch profile and press **F5** or click **Start**.
4. Visual Studio uses `Microsoft.AspNetCore.SpaProxy` to automatically launch the Vite dev server and open your browser at `http://localhost:5173`.

#### 3. Via Visual Studio Code / Cursor / Antigravity (F5)
1. Open the `WorkSphere/` folder.
2. Go to the **Run & Debug** panel (`Ctrl+Shift+D`).
3. Select **"WorkSphere: Run Both (Server + Client)"** from the dropdown and press **F5**.

---

### Option B: Run Projects Independently

#### Backend (`WorkSphere.Server`)
```bash
cd WorkSphere.Server
dotnet restore
dotnet build
dotnet run --launch-profile api-only
```
- API Root: `http://localhost:5069`
- Health check: `http://localhost:5069/api/health`
- OpenAPI JSON: `http://localhost:5069/openapi/v1.json`

#### Frontend (`WorkSphere.Client`)
```bash
cd WorkSphere.Client
npm install       # only if dependencies are not already present
npm run dev
```
- Client App: `http://localhost:5173`
- Client dev server proxies `/api/*` automatically to `http://localhost:5069`.

---

## 5. Verification Status

- **Backend Build:** Verified (`dotnet build WorkSphere.sln` passed with 0 errors).
- **Backend Runtime:** Verified (`GET /api/health` returned HTTP 200 OK with `status: "Healthy"`).
- **Frontend Reverse Proxy:** Verified (`GET http://localhost:5173/api/health` successfully proxied to backend).
- **Frontend Runtime:** Verified (`GET http://localhost:5173/` returned HTTP 200 OK).
- **Frontend Production Build:** Verified (`npm run build` compiled cleanly into production bundle).

