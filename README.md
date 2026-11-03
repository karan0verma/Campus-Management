# Campus Management System

### A Web-Based College Infrastructure and Maintenance Management Platform

## About the Project

Managing college infrastructure involves keeping track of different buildings, classrooms, laboratories, and the equipment installed in them. When equipment stops working, reporting the issue and getting it repaired can become difficult without a proper system.

The **Campus Management System** is being developed to address this problem through a centralized web application.

The application allows the college administration to create a digital structure of its infrastructure, register equipment room-wise, and manage maintenance complaints. Students can report problems with specific equipment, administrators can assign those complaints to technicians, and technicians can update the repair status.

The system also maintains the complaint and repair history of individual equipment, making previous maintenance records easier to access.

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

## Main Modules

### 1. Infrastructure Management

The administrator can create and maintain the college's digital layout by adding buildings, floors, classrooms, and laboratories.

Each room or laboratory is associated with its respective building and floor, making it easier to locate equipment.

### 2. Equipment Records

Equipment is registered under its actual room or laboratory.

Each individually tracked equipment item has a unique identification number, name, location, and working status.

For example:

| Equipment ID | Equipment | Location | Status |
|---|---|---|---|
| PC-001 | Computer | Lab 1 | Working |
| AC-001 | Air Conditioner | Lab 1 | Not Working |
| FAN-001 | Ceiling Fan | Room 101 | Working |

### 3. Student Complaint Module

Students can navigate through the college layout, select a room, choose the equipment having a problem, and submit a complaint with its description.

After submission, a complaint ticket is generated and becomes visible in the administrator's dashboard. Students can also track the progress of their complaints.

### 4. Admin Module

The administrator manages the infrastructure and equipment records and handles incoming complaints.

The admin can review complaint details, identify the affected equipment, assign the complaint to a technician, and monitor its status until resolution.

### 5. Technician Module

Technicians can access the complaints assigned to them.

They can view the equipment details and its location, update the repair progress, enter repair remarks, and mark the complaint as resolved after completing the work.

### 6. Equipment Maintenance History

Each equipment record maintains its associated complaint and repair history.

This allows the administrator to check previously reported problems, repair remarks, and the current working status of equipment.

## User Roles

| Role | Responsibilities |
|---|---|
| Student | Browse infrastructure, report equipment problems, and track complaints. |
| Admin | Manage infrastructure and equipment, review complaints, and assign technicians. |
| Technician | View assigned complaints, update repair progress, and resolve issues. |

## Complaint Lifecycle

Every complaint moves through the following stages:

| Status | Meaning |
|---|---|
| Pending | A student has submitted a complaint. |
| Assigned | The administrator has assigned it to a technician. |
| In Progress | The technician is working on the issue. |
| Resolved | The reported issue has been repaired. |

## Technology Stack

The application uses a full-stack architecture with a separate frontend and backend.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js | Building the user interface |
| Language | TypeScript | Frontend development |
| Styling | Tailwind CSS | UI styling and responsive layouts |
| Backend | Python | Server-side development |
| Framework | Django REST Framework | Backend APIs and application logic |
| Database | MySQL | Storing application records |
| API | REST API | Communication between frontend and backend |
| Version Control | Git & GitHub | Source code management |

## Database Overview

MySQL is used to store the application's data and maintain relationships between different records.

The database covers the following entities:

- Users and their roles
- Buildings and floors
- Rooms and laboratories
- Equipment records
- Student complaints
- Technician assignments
- Repair remarks and maintenance history

## Project Structure

```text
Campus-Management/
│
├── frontend/              # Next.js application
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
│
├── backend/               # Django REST Framework
│   ├── manage.py
│   ├── apps/
│   └── config/
│
├── README.md
└── .gitignore
```

*The structure shown above represents the intended organization; actual folders may differ.*

## Project Objective

The objective is to develop a practical college maintenance system in which infrastructure records, equipment details, complaints, and repair activities can be managed from one place.

Instead of handling equipment complaints through disconnected manual processes, the application provides a common workflow for students, administrators, and technicians.

## Future Enhancements

- Deployment for use within a college campus.
- Further improvements to the mobile user experience.
- Additional usability and performance improvements.

---

**Project:** Campus Management System  
**Category:** Full-Stack Web Development  
**Domain:** College Infrastructure and Maintenance Management
