ALTER TABLE Evidence ADD COLUMN Date_Collected DATE;
ALTER TABLE Evidence ADD COLUMN Collected_By VARCHAR(100);
ALTER TABLE Evidence ADD COLUMN Linked_Suspect_ID INT REFERENCES Suspects(Suspect_ID);
