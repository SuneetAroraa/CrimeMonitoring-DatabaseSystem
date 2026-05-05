-- 1. FIR_Full_Details: joins fir, officer, location, case_status, crime_type, complaint, victim in one view
CREATE OR REPLACE VIEW fir_full_details AS
SELECT 
    f.fir_id,
    f.fir_date,
    f.is_deleted,
    c.complaint_id,
    c.date AS complaint_date,
    c.description AS complaint_description,
    ct.crime_id,
    ct.crime_name,
    ct.description AS crime_description,
    o.officer_id,
    o.name AS officer_name,
    o.`rank` AS officer_rank,
    o.station AS officer_station,
    l.location_id,
    l.city,
    l.state,
    l.pincode,
    cs.status_id,
    cs.status AS case_status,
    cs.updated_on_date AS status_updated_on,
    v.victim_id,
    v.name AS victim_name,
    v.age AS victim_age,
    v.gender AS victim_gender,
    v.contact AS victim_contact
FROM fir f
JOIN complaint c ON f.complaint_id = c.complaint_id
JOIN crime_type ct ON f.crime_id = ct.crime_id
LEFT JOIN officer o ON f.officer_id = o.officer_id
LEFT JOIN location l ON f.location_id = l.location_id
LEFT JOIN case_status cs ON f.fir_id = cs.fir_id
JOIN victim v ON c.victim_id = v.victim_id;

-- 2. Open_Cases_Summary: all firs where case_status = 'Open' with officer name and location
CREATE OR REPLACE VIEW open_cases_summary AS
SELECT 
    f.fir_id,
    f.fir_date,
    cs.status,
    o.name AS assigned_officer,
    l.city,
    l.state
FROM fir f
JOIN case_status cs ON f.fir_id = cs.fir_id
LEFT JOIN officer o ON f.officer_id = o.officer_id
LEFT JOIN location l ON f.location_id = l.location_id
WHERE cs.status = 'Open' AND f.is_deleted = 0;

-- 3. Crime_Stats_By_City: GROUP BY city showing count of firs per city
CREATE OR REPLACE VIEW crime_stats_by_city AS
SELECT 
    l.city,
    COUNT(f.fir_id) AS total_firs
FROM location l
LEFT JOIN fir f ON l.location_id = f.location_id AND f.is_deleted = 0
GROUP BY l.city;
