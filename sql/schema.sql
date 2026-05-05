SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS victim;
DROP TABLE IF EXISTS officer;
DROP TABLE IF EXISTS accused;
DROP TABLE IF EXISTS suspects;
DROP TABLE IF EXISTS crime_type;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS fir;
DROP TABLE IF EXISTS fir_suspects;
DROP TABLE IF EXISTS fir_accused;
DROP TABLE IF EXISTS case_status;
DROP TABLE IF EXISTS case_outcome;
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS audit_log;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE location (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10)
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CONSTRAINT chk_users_role CHECK (role IN ('Admin', 'Officer', 'Detective', 'Judicial')) NOT NULL
);

CREATE TABLE victim (
  victim_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT CONSTRAINT chk_victim_age CHECK (age > 0),
  gender VARCHAR(10) CONSTRAINT chk_victim_gender CHECK (gender IN ('Male', 'Female', 'Other')),
  contact VARCHAR(15),
  address VARCHAR(200),
  user_id INT REFERENCES users(user_id)
);

CREATE TABLE officer (
  officer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  `rank` VARCHAR(50),
  department VARCHAR(100),
  station VARCHAR(100),
  contact VARCHAR(15),
  user_id INT REFERENCES users(user_id)
);

CREATE TABLE accused (
  accused_id INT AUTO_INCREMENT PRIMARY KEY,
  accused_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  age INT CONSTRAINT chk_accused_age CHECK (age > 0),
  address VARCHAR(200),
  contact_no VARCHAR(15),
  nationality VARCHAR(50) DEFAULT 'Indian',
  status VARCHAR(50) DEFAULT 'At Large',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suspects (
  suspect_id INT AUTO_INCREMENT PRIMARY KEY,
  suspect_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  age INT CONSTRAINT chk_suspects_age CHECK (age > 0),
  address VARCHAR(200),
  contact_no VARCHAR(15),
  nationality VARCHAR(50) DEFAULT 'Indian',
  status VARCHAR(50) DEFAULT 'Under Surveillance',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crime_type (
  crime_id INT AUTO_INCREMENT PRIMARY KEY,
  crime_name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE complaint (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT,
  victim_id INT NOT NULL,
  crime_id INT,
  FOREIGN KEY (victim_id) REFERENCES victim(victim_id),
  FOREIGN KEY (crime_id) REFERENCES crime_type(crime_id)
);

CREATE TABLE fir (
  fir_id INT AUTO_INCREMENT PRIMARY KEY,
  fir_date DATE NOT NULL,
  complaint_id INT UNIQUE NOT NULL,
  crime_id INT,
  officer_id INT,
  location_id INT,
  is_deleted TINYINT(1) DEFAULT 0,
  FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id),
  FOREIGN KEY (crime_id) REFERENCES crime_type(crime_id),
  FOREIGN KEY (officer_id) REFERENCES officer(officer_id),
  FOREIGN KEY (location_id) REFERENCES location(location_id)
);

CREATE TABLE fir_suspects (
  fir_suspects_id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT,
  suspect_id INT,
  reason_for_suspicion TEXT,
  date_linked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_fir_suspects UNIQUE (fir_id, suspect_id),
  FOREIGN KEY (fir_id) REFERENCES fir(fir_id),
  FOREIGN KEY (suspect_id) REFERENCES suspects(suspect_id)
);

CREATE TABLE fir_accused (
  fir_accused_id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT,
  accused_id INT,
  role_in_crime VARCHAR(200),
  date_linked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_fir_accused UNIQUE (fir_id, accused_id),
  FOREIGN KEY (fir_id) REFERENCES fir(fir_id),
  FOREIGN KEY (accused_id) REFERENCES accused(accused_id)
);

CREATE TABLE case_status (
  status_id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT UNIQUE NOT NULL,
  status VARCHAR(30) CONSTRAINT chk_case_status CHECK (status IN ('Open', 'Under Investigation', 'Closed')) NOT NULL DEFAULT 'Open',
  updated_on_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  FOREIGN KEY (fir_id) REFERENCES fir(fir_id)
);

CREATE TABLE case_outcome (
  outcome_id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT UNIQUE NOT NULL,
  outcome VARCHAR(100),
  outcome_date DATE,
  remarks TEXT,
  FOREIGN KEY (fir_id) REFERENCES fir(fir_id)
);

CREATE TABLE evidence (
  evidence_id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT NOT NULL,
  evidence_type VARCHAR(100),
  description TEXT,
  location VARCHAR(200),
  date_collected DATE,
  collected_by VARCHAR(100),
  linked_suspect_id INT,
  FOREIGN KEY (fir_id) REFERENCES fir(fir_id),
  FOREIGN KEY (linked_suspect_id) REFERENCES suspects(suspect_id)
);

CREATE TABLE audit_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(100),
  operation VARCHAR(10),
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_data JSON,
  new_data JSON
);
