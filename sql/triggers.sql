DELIMITER //

-- 1. After INSERT on fir -> automatically INSERT a row into case_status with status = 'Open'
DROP TRIGGER IF EXISTS after_fir_insert_status //
CREATE TRIGGER after_fir_insert_status
AFTER INSERT ON fir
FOR EACH ROW
BEGIN
    INSERT INTO case_status (fir_id, status, updated_on_date)
    VALUES (NEW.fir_id, 'Open', CURRENT_DATE);
END //


-- 2. After UPDATE on case_status -> INSERT a row into audit_log
DROP TRIGGER IF EXISTS after_case_status_update //
CREATE TRIGGER after_case_status_update
AFTER UPDATE ON case_status
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_log (table_name, operation, changed_by, old_data, new_data)
        VALUES (
            'case_status',
            'UPDATE',
            USER(),
            JSON_OBJECT('status_id', OLD.status_id, 'fir_id', OLD.fir_id, 'status', OLD.status, 'updated_on_date', OLD.updated_on_date),
            JSON_OBJECT('status_id', NEW.status_id, 'fir_id', NEW.fir_id, 'status', NEW.status, 'updated_on_date', NEW.updated_on_date)
        );
    END IF;
END //


-- 3. After INSERT on fir -> INSERT into audit_log
DROP TRIGGER IF EXISTS after_fir_insert_audit_trigger //
CREATE TRIGGER after_fir_insert_audit_trigger
AFTER INSERT ON fir
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, operation, changed_by, old_data, new_data)
    VALUES (
        'fir',
        'INSERT',
        USER(),
        NULL,
        JSON_OBJECT('fir_id', NEW.fir_id, 'fir_date', NEW.fir_date, 'complaint_id', NEW.complaint_id, 'crime_id', NEW.crime_id, 'officer_id', NEW.officer_id, 'location_id', NEW.location_id)
    );
END //

DELIMITER ;
