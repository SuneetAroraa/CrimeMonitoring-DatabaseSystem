<div align="center">
  <img src="https://via.placeholder.com/800x200/0f172a/ef4444?text=Crime+Monitoring+Database+System" alt="Crime Monitoring System Banner">
  
  <h1>Crime Monitoring Database System</h1>
  <p>A full-stack web application designed for law enforcement to monitor and manage crimes, built to showcase advanced Database Management System (DBMS) concepts.</p>

  <div>
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </div>
</div>

## 📌 Features

- **Role-Based Access Control (RBAC):** Admin, Officer, Detective, and Judicial roles.
- **Advanced Dashboard:** Real-time analytics built purely using SQL GROUP BY and aggregation operations.
- **FIR Management:** Create, view, update, and search First Information Reports.
- **Case Tracking:** Manage suspects, accused, evidence, and case status.
- **Audit Logging:** Database triggers automatically record every status change and new FIR creation.
- **PDF Generation:** Export comprehensive FIR documents in a click.

## 🎓 DBMS Concepts Demonstrated

This project explicitly focuses on academic database concepts:

1. **Raw SQL Operations:** Avoiding ORMs for complex queries to demonstrate raw `SELECT`, `JOIN`, `GROUP BY`, and `HAVING`.
2. **PostgreSQL Triggers:**
   - Automatically initializes Case Status to 'Open' upon FIR creation.
   - Maintains an immutable `Audit_Log` tracking `Old_Data` and `New_Data` differences.
3. **Stored Procedures:** `register_complaint_and_fir` encapsulates multiple inserts (Complaint + FIR) within a single ACID-compliant transaction with automatic rollback on error.
4. **Views:** Utilizes comprehensive views like `FIR_Full_Details` and `Crime_Stats_By_City` to abstract complex schema joins from the application logic.
5. **Normalization:** The database schema adheres to 3NF standards.
6. **Soft Deletion:** Implemented `is_deleted` flags to preserve historical data integrity.

## 🗄️ Database Schema & ER Diagram

The system comprises the following core entities:
`Users`, `Location`, `Victim`, `Officer`, `Crime_Type`, `Complaint`, `FIR`, `Suspects`, `Accused`, `Case_Status`, `Case_Outcome`, `Evidence`, `Audit_Log`.

Relationships:
- 1 Complaint -> 1 FIR (1:1)
- 1 FIR -> Many Suspects/Accused/Evidence (1:N)
- 1 FIR -> 1 Case_Status (1:1 tracking active state)
- Many FIRs -> 1 Officer/Location/Crime_Type (N:1)

## 🚀 Setup & Installation

### Option 1: Docker (Recommended One-Liner)

Make sure you have Docker and Docker Compose installed.

```bash
docker-compose up --build
```

This will automatically:
1. Spin up a PostgreSQL 15 container.
2. Initialize the schema, triggers, views, stored procedures, and seed data automatically.
3. Start the FastAPI backend on `http://localhost:8000`.
4. Start the Next.js frontend on `http://localhost:3000`.

### Option 2: Manual Setup

1. Start a local PostgreSQL server and create a database `crime_monitoring`.
2. Run the SQL files located in `sql/` in numeric order (schema -> triggers -> views -> procedures -> seed).
3. Set up the Python Backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   export DATABASE_URL="postgresql://user:pass@localhost:5432/crime_monitoring"
   uvicorn app.main:app --reload
   ```
4. Set up the Next.js Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔑 Test Credentials

All accounts use the password: `password`

- **Admin:** `admin1`
- **Officer:** `officer1`
- **Detective:** `detective1`
- **Judicial:** `judicial1`
