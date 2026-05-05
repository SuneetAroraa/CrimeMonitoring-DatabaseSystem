<div align="center">
  <img src="https://via.placeholder.com/800x200/0f172a/ef4444?text=Crime+Monitoring+Database+System" alt="Crime Monitoring System Banner">
  
  <h1>Crime Monitoring Database System</h1>
  <p>A full-stack web application designed for law enforcement to monitor and manage crimes, built to showcase advanced Database Management System (DBMS) concepts.</p>

  <div>
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </div>
</div>

---

## Project Overview & Features

This system provides a digital infrastructure for registering, tracking, and analyzing crime data.

- **Role-Based Access Control (RBAC):** Distinct interfaces and permissions for Admin, Officer, Detective, and Judicial roles.
- **Advanced Real-Time Dashboard:** Crime analytics, demographic breakdowns, and status reports built purely using SQL `GROUP BY` and aggregation functions.
- **FIR (First Information Report) Management:** Securely create, view, update, and search FIR records.
- **Comprehensive Case Tracking:** Link Suspects, Accused individuals, and Evidence directly to specific cases.
- **Automated Audit Logging:** Database-level triggers track every state change automatically, ensuring an immutable record for judicial review.
- **Automated Deployments:** Full Dockerization for seamless one-click setups.

## DBMS Concepts Demonstrated

This project explicitly focuses on academic and enterprise database architecture concepts:

1. **MySQL Triggers:**
   - Automatically initializes Case Status to 'Open' upon FIR creation.
   - Maintains an immutable `Audit_Log` tracking exact `Old_Data` and `New_Data` differences for critical tables.
2. **Stored Procedures & ACID Transactions:** 
   - Procedures like `register_complaint_and_fir` encapsulate multiple inserts (e.g., Complaint + FIR) within a single ACID-compliant transaction with automatic `ROLLBACK` on error, ensuring absolute data integrity.
3. **Advanced Views:** 
   - Utilizes comprehensive views like `FIR_Full_Details` and `Crime_Stats_By_City` to abstract complex schema joins away from the application logic.
4. **Relational Constraints & Normalization:** 
   - The database schema strictly adheres to 3NF standards, heavily utilizing `FOREIGN KEY` constraints with `CASCADE` rules where appropriate.
5. **Raw SQL Operations:** 
   - Backend routes heavily utilize complex raw `SELECT`, `JOIN`, `GROUP BY`, and `HAVING` clauses to demonstrate pure SQL proficiency over abstract ORMs.
6. **Soft Deletion:** 
   - Implemented `is_deleted` flags to preserve historical data integrity instead of permanent `DELETE` operations.

## Database Schema & ER Diagram

The system is built upon a normalized schema comprising the following core entities:
`users`, `location`, `victim`, `officer`, `crime_type`, `complaint`, `fir`, `suspects`, `accused`, `case_status`, `case_outcome`, `evidence`, and `audit_log`.

**Core Relationships:**
- **1 Complaint ↔ 1 FIR** (1:1)
- **1 FIR ↔ Many Suspects / Accused / Evidence** (1:N)
- **1 FIR ↔ 1 Case_Status** (1:1 tracking active state)
- **Many FIRs ↔ 1 Officer / Location / Crime_Type** (N:1)

## Setup & Installation

### Option 1: Docker (Recommended One-Liner)

Make sure you have [Docker](https://www.docker.com/) and Docker Compose installed.

```bash
docker-compose up --build
```

This single command will automatically:
1. Spin up a **MySQL 8.0** database container.
2. Execute the initialization scripts to build the schema, triggers, views, stored procedures, and insert seed data automatically.
3. Start the **FastAPI** backend server on `http://localhost:8000`.
4. Start the **Next.js** frontend application on `http://localhost:3000`.

### Option 2: Manual Setup

1. **Database Setup:**
   Start a local MySQL server and create a database named `crime_monitoring`.
   Run the SQL files located in the `sql/` directory in numeric order (schema -> triggers -> views -> procedures -> seed).

2. **Backend Setup (Python/FastAPI):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   # Ensure your local MySQL credentials match:
   export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/crime_monitoring"
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup (Next.js/React):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Test Credentials

Use the following credentials to test the various Role-Based Access Control interfaces. Password for all test accounts is `password`.

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin1` | `password` |
| **Officer** | `officer1` | `password` |
| **Detective** | `detective1` | `password` |

---
*Built as a comprehensive demonstration of Database Management Systems architecture.*
