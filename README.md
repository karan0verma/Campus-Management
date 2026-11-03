# Campus Management System (CampusOps)

### A Web-Based College Infrastructure and Maintenance Management Platform

## About the Project

Managing college infrastructure involves keeping track of different buildings, classrooms, laboratories, and the equipment installed in them. When equipment stops working, reporting the issue and getting it repaired can become difficult without a proper system.

The **Campus Management System (CampusOps)** is a full-stack centralized web application built to digitally manage a college's physical infrastructure hierarchy, room-wise equipment registries, and end-to-end maintenance complaint workflows across three distinct user roles: **Student**, **Admin**, and **Technician**.

The system also maintains the complaint and repair history of individual equipment, making previous maintenance records instantly accessible.

---

## How the System Works

The application follows a simple process:

```text
College Infrastructure
         |
         v
Buildings → Floors → Rooms / Labs
         |
         v
   Equipment Records
         |
         v
 Student Reports a Problem
         |
         v
    Complaint Ticket
         |
         v
    Admin Dashboard
         |
         v
 Technician Assignment
         |
         v
   Repair and Resolution
         |
         v
 Equipment Status & History
```

---

## 🚀 Live Services & Architecture

| Layer | Technology | Port / Address | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Lucide | [http://localhost:3000](http://localhost:3000) | Responsive role-tailored web portal |
| **Backend** | Python, Django REST Framework (DRF), SimpleJWT | [http://127.0.0.1:8000](http://127.0.0.1:8000) | RESTful API with role-based permissions |
| **Database** | PostgreSQL 16 | `127.0.0.1:5432` (`campusops_db`) | Relational persistence with foreign keys |
| **Admin Portal** | Django Visual Admin | [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) | Complete visual DB management |

---

## Main Modules

### 1. Infrastructure Management
The administrator can create and maintain the college's digital layout by adding buildings, floors, classrooms, and laboratories. Each room or laboratory is associated with its respective building and floor, making it easier to locate equipment.

### 2. Equipment Records
Equipment is registered under its actual room or laboratory with a unique equipment ID, name, location, and working status (`Working` / `Not Working`).

For example:
| Equipment ID | Equipment | Location | Status |
|---|---|---|---|
| PC-001 | Computer | Lab 1 | Working |
| AC-001 | Air Conditioner | Lab 1 | Not Working |
| FAN-001 | Ceiling Fan | Room 101 | Working |

### 3. Student Complaint Module
Students can navigate through the college layout, select a room, choose the equipment having a problem, and submit a complaint with its description. A unique ticket ID (`TKT-YYYYMMDD-XXXXX`) is generated and equipment status automatically switches to `Not Working`.

### 4. Admin Module
The administrator manages the infrastructure and equipment records, reviews incoming complaints, assigns them to registered technicians, and monitors repair progress.

### 5. Technician Module
Technicians can view their assigned complaints, inspect equipment location, update repair progress to `In Progress`, add diagnostic remarks, and mark the complaint as `Resolved`.

### 6. Equipment Maintenance History
Every equipment item maintains a complete chronological ledger of complaints, assigned technicians, status transitions, and repair remarks.

---

## 👥 Demo User Accounts

The database comes pre-seeded with realistic data and demo credentials. The login screen also features **One-Click Demo Login** buttons for instant testing:

| Role | Username | Password | Full Name | Department / Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Administrator System | Full CRUD on layout, equipment, technician dispatch & user management |
| **Student** | `student_arun` | `student123` | Arun Verma | CS Dept; browse layout, view equipment & raise complaints |
| **Student** | `student_sneha` | `student123` | Sneha Patel | ECE Dept; browse layout, view equipment & raise complaints |
| **Technician** | `tech_raj` | `tech123` | Rajesh Kumar | Electrical & Hardware; view assigned tasks, update progress & resolve repairs |
| **Technician** | `tech_priya` | `tech123` | Priya Sharma | IT Infrastructure; view assigned tasks, update progress & resolve repairs |

---

## 🔐 Self-Registration & Security Passkeys

CampusOps supports self-registration at `/signup` with role verification so students cannot grant themselves administrative privileges:
- **Student Registration:** Open to all students with Roll No / Student ID.
- **Technician Registration:** Requires Technician Passkey: `TECH@CAMPUS2026`.
- **Admin Registration:** Requires Master Admin Passkey: `ADMIN@CAMPUS2026`.

---

## 🔄 Complaint Lifecycle

Every complaint moves through exactly four statuses:

| Status | Meaning |
|---|---|
| **Pending** | A student has submitted a complaint. Equipment status automatically toggles to `Not Working`. |
| **Assigned** | The administrator has assigned the ticket to a technician. |
| **In Progress** | The technician has started inspection/repair and logged progress remarks. |
| **Resolved** | The technician completed repairs, logged final remarks, and resolved the ticket. Equipment status automatically restores to `Working`. |

---

## 📁 Project Structure

```text
Campus-Management/
├── backend/                  # Django REST Framework
│   ├── api/                  # Models, Views, Serializers, Admin, Migrations
│   │   ├── models.py         # User, Building, Floor, Room, Equipment, Complaint, RepairRemark
│   │   ├── views.py          # ViewSets & Auth endpoints
│   │   ├── admin.py          # Django visual admin registration
│   │   └── urls.py           # API routes
│   ├── campusops_backend/    # Django project settings & wsgi
│   └── manage.py
│
├── frontend/                 # Next.js 14 App Router application
│   ├── src/
│   │   ├── app/              # Role-based pages: /admin, /student, /technician, /login, /signup
│   │   ├── components/       # Modals, Navbar, StatusBadge, ProtectedRoute
│   │   └── lib/              # API client & Auth context
│   ├── package.json
│   └── tailwind.config.ts
│
├── README.md
├── .gitignore
├── verify_e2e.py             # 11-step automated verification test
└── test_registration_roles.py # Role passkey verification test
```

---

## 🛠️ Verification & Testing

The complete 11-step end-to-end workflow was executed and verified:
1. Admin creates building, floor, and room.
2. Admin registers equipment in that room with a unique equipment ID.
3. Student logs in and navigates layout to that equipment.
4. Student raises a complaint -> unique ticket ID (`TKT-YYYYMMDD-XXXXX`) generated in PostgreSQL; equipment automatically marks as `Not Working`.
5. Complaint immediately appears in the Admin Dashboard.
6. Admin assigns the complaint to a registered technician.
7. Technician logs in and sees the assigned complaint.
8. Technician updates status to `In Progress` and adds diagnosis remarks.
9. Technician marks complaint as `Resolved` with detailed repair remarks.
10. Equipment status automatically restores to `Working`, and updated status is visible across Student, Admin, and Technician views.
11. Equipment maintenance history displays the complete chronological ledger of complaints, dates, assigned technicians, status transitions, and repair remarks.

---

## 💻 Local Setup & Running

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 2. Backend Setup
```bash
cd backend
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt psycopg2
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`.
Visual database management is available at `http://127.0.0.1:8000/admin/`.
