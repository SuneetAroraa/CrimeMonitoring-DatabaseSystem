DELIMITER //

DROP PROCEDURE IF EXISTS register_complaint_and_fir //

CREATE PROCEDURE register_complaint_and_fir(
    IN p_victim_id INT,
    IN p_crime_id INT,
    IN p_officer_id INT,
    IN p_location_id INT,
    IN p_description TEXT,
    IN p_date DATE,
    OUT p_fir_id INT
)
BEGIN
    DECLARE v_complaint_id INT;
    
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error occurred while registering complaint and FIR';
    END;

    START TRANSACTION;
    
    -- 1. Insert into complaint table
    INSERT INTO complaint (date, description, victim_id, crime_id)
    VALUES (p_date, p_description, p_victim_id, p_crime_id);
    
    SET v_complaint_id = LAST_INSERT_ID();
    
    -- 2. Insert into fir table
    INSERT INTO fir (fir_date, complaint_id, crime_id, officer_id, location_id)
    VALUES (p_date, v_complaint_id, p_crime_id, p_officer_id, p_location_id);
    
    SET p_fir_id = LAST_INSERT_ID();
    
    -- case_status will be automatically inserted by after_fir_insert_status trigger
    
    COMMIT;
END //

DROP PROCEDURE IF EXISTS add_suspect //

CREATE PROCEDURE add_suspect(
    IN p_suspect_name VARCHAR(100),
    IN p_gender VARCHAR(10),
    IN p_age INT,
    IN p_address VARCHAR(200),
    IN p_contact_no VARCHAR(15),
    IN p_nationality VARCHAR(50),
    IN p_status VARCHAR(50),
    OUT p_suspect_id INT
)
BEGIN
    INSERT INTO suspects (suspect_name, gender, age, address, contact_no, nationality, status)
    VALUES (p_suspect_name, p_gender, p_age, p_address, p_contact_no, p_nationality, p_status);
    
    SET p_suspect_id = LAST_INSERT_ID();
END //

DROP PROCEDURE IF EXISTS add_accused //

CREATE PROCEDURE add_accused(
    IN p_accused_name VARCHAR(100),
    IN p_gender VARCHAR(10),
    IN p_age INT,
    IN p_address VARCHAR(200),
    IN p_contact_no VARCHAR(15),
    IN p_nationality VARCHAR(50),
    IN p_status VARCHAR(50),
    OUT p_accused_id INT
)
BEGIN
    INSERT INTO accused (accused_name, gender, age, address, contact_no, nationality, status)
    VALUES (p_accused_name, p_gender, p_age, p_address, p_contact_no, p_nationality, p_status);
    
    SET p_accused_id = LAST_INSERT_ID();
END //

DELIMITER ;
