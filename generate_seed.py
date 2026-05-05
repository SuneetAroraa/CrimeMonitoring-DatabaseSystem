import random
from datetime import datetime, timedelta

def generate_sql():
    sql = """-- Clean existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE evidence;
TRUNCATE TABLE case_outcome;
TRUNCATE TABLE case_status;
TRUNCATE TABLE fir_accused;
TRUNCATE TABLE fir_suspects;
TRUNCATE TABLE fir;
TRUNCATE TABLE complaint;
TRUNCATE TABLE crime_type;
TRUNCATE TABLE suspects;
TRUNCATE TABLE accused;
TRUNCATE TABLE officer;
TRUNCATE TABLE victim;
TRUNCATE TABLE users;
TRUNCATE TABLE location;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Locations
INSERT INTO location (state, city, pincode) VALUES 
"""
    locations = []
    cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur']
    states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Maharashtra', 'West Bengal', 'Gujarat', 'Gujarat', 'Rajasthan']
    for i in range(50):
        c_idx = random.randint(0, 9)
        locations.append(f"('{states[c_idx]}', '{cities[c_idx]}', '4000{i:02d}')")
    sql += ",\n".join(locations) + ";\n\n"

    sql += """-- Insert Crime Types
INSERT INTO crime_type (crime_name, description) VALUES 
('Theft', 'Taking of another persons property without permission.'),
('Assault', 'Physical attack or threat of attack.'),
('Fraud', 'Wrongful or criminal deception intended to result in financial or personal gain.'),
('Murder', 'The unlawful premeditated killing of one human being by another.'),
('Cybercrime', 'Criminal activities carried out by means of computers or the Internet.'),
('Burglary', 'Illegal entry of a building with intent to commit a crime.'),
('Robbery', 'Taking property unlawfully from a person by force or threat.'),
('Extortion', 'Obtaining money or property by threat.');

"""

    sql += "-- Insert Users\n"
    sql += "INSERT INTO users (username, password_hash, role) VALUES\n"
    h = "$2b$12$nxqAipZ5AYECNNsrP94xfOn9mqs26XjH2mKAwBhs3C220t7BgsLla"
    users = [
        f"('admin', '{h}', 'Admin')",
        f"('officer', '{h}', 'Officer')",
        f"('detective', '{h}', 'Detective')",
        f"('judicial', '{h}', 'Judicial')"
    ]
    roles = ['Officer', 'Detective', 'Judicial', 'Admin']
    for i in range(1, 51):
        users.append(f"('user{i}', '{h}', '{random.choice(roles)}')")
    sql += ",\n".join(users) + ";\n\n"

    sql += "-- Insert Officers\n"
    sql += "INSERT INTO officer (name, `rank`, department, station, contact, user_id) VALUES\n"
    officers = []
    ranks = ['Inspector', 'Sub-Inspector', 'Constable', 'Superintendent', 'DSP']
    depts = ['Homicide', 'Cyber Cell', 'Narcotics', 'Traffic', 'General']
    for i in range(1, 51):
        officers.append(f"('Officer Name {i}', '{random.choice(ranks)}', '{random.choice(depts)}', 'Station {random.randint(1, 10)}', '9876543{i:03d}', {random.randint(1, 54)})")
    sql += ",\n".join(officers) + ";\n\n"

    sql += "-- Insert Victims\n"
    sql += "INSERT INTO victim (name, age, gender, contact, address, user_id) VALUES\n"
    victims = []
    genders = ['Male', 'Female', 'Other']
    for i in range(1, 51):
        victims.append(f"('Victim Name {i}', {random.randint(18, 80)}, '{random.choice(genders)}', '9998887{i:03d}', 'Address {i}', NULL)")
    sql += ",\n".join(victims) + ";\n\n"

    sql += "-- Insert Suspects\n"
    sql += "INSERT INTO suspects (suspect_name, gender, age, address, contact_no, status) VALUES\n"
    suspects = []
    for i in range(1, 51):
        suspects.append(f"('Suspect Name {i}', '{random.choice(genders)}', {random.randint(18, 80)}, 'Address S{i}', '7776665{i:03d}', 'Under Surveillance')")
    sql += ",\n".join(suspects) + ";\n\n"

    sql += "-- Insert Accused\n"
    sql += "INSERT INTO accused (accused_name, gender, age, address, contact_no, status) VALUES\n"
    accused = []
    for i in range(1, 51):
        accused.append(f"('Accused Name {i}', '{random.choice(genders)}', {random.randint(18, 80)}, 'Address A{i}', '8887776{i:03d}', 'At Large')")
    sql += ",\n".join(accused) + ";\n\n"

    sql += "-- Insert Complaints\n"
    sql += "INSERT INTO complaint (date, description, victim_id, crime_id) VALUES\n"
    complaints = []
    for i in range(1, 51):
        date = (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
        complaints.append(f"('{date}', 'Complaint Description {i}', {random.randint(1, 50)}, {random.randint(1, 8)})")
    sql += ",\n".join(complaints) + ";\n\n"

    sql += "-- Insert FIRs\n"
    sql += "INSERT INTO fir (fir_date, complaint_id, crime_id, officer_id, location_id, is_deleted) VALUES\n"
    firs = []
    for i in range(1, 51):
        date = (datetime.now() - timedelta(days=random.randint(1, 360))).strftime('%Y-%m-%d')
        firs.append(f"('{date}', {i}, {random.randint(1, 8)}, {random.randint(1, 50)}, {random.randint(1, 50)}, 0)")
    sql += ",\n".join(firs) + ";\n\n"

    sql += "-- Insert Case Outcomes\n"
    sql += "INSERT INTO case_outcome (fir_id, outcome, outcome_date, remarks) VALUES\n"
    outcomes = []
    for i in range(1, 25): 
        date = (datetime.now() - timedelta(days=random.randint(1, 100))).strftime('%Y-%m-%d')
        outcomes.append(f"({i}, 'Convicted', '{date}', 'Resolved successfully.')")
    sql += ",\n".join(outcomes) + ";\n\n"

    sql += "-- Insert Evidence\n"
    sql += "INSERT INTO evidence (fir_id, evidence_type, description, location, date_collected) VALUES\n"
    evidence = []
    types = ['Weapon', 'Document', 'Digital', 'Physical', 'Biological']
    for i in range(1, 51):
        date = (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
        evidence.append(f"({random.randint(1, 50)}, '{random.choice(types)}', 'Evidence description {i}', 'Scene {i}', '{date}')")
    sql += ",\n".join(evidence) + ";\n\n"

    sql += "-- Insert FIR_Suspects\n"
    sql += "INSERT INTO fir_suspects (fir_id, suspect_id, reason_for_suspicion) VALUES\n"
    fir_suspects = [f"({i}, {i}, 'Suspicious activity observed {i}')" for i in range(1, 51)]
    sql += ",\n".join(fir_suspects) + ";\n\n"

    sql += "-- Insert FIR_Accused\n"
    sql += "INSERT INTO fir_accused (fir_id, accused_id, role_in_crime) VALUES\n"
    fir_accused = [f"({i}, {i}, 'Primary suspect {i}')" for i in range(1, 51)]
    sql += ",\n".join(fir_accused) + ";\n\n"

    with open("sql/seed.sql", "w") as f:
        f.write(sql)
        
    print("seed.sql generated successfully with lowercase column names and CORRECT hashes.")

if __name__ == "__main__":
    generate_sql()
