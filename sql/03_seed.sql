USE julisgistry;
TRUNCATE TABLE projects;

INSERT INTO projects (project_name, latitude, longitude, owner_name, carbon_credits)
VALUES ('Northern Forest Restoration', 13.7563, 100.5018, 'Example Forestry Co.', 2500),
       ('Western Forest Recovery',     13.7563, 100.5018, 'Oneal', 100);

-- bulk rows so EXPLAIN shows a real difference (MySQL 8+)
SET SESSION cte_max_recursion_depth = 5000;
INSERT INTO projects (project_name, latitude, longitude, owner_name, carbon_credits)
WITH RECURSIVE seq AS (
  SELECT 1 AS n UNION ALL SELECT n + 1 FROM seq WHERE n < 5000
)
SELECT CONCAT('Project ', n), 13.75, 100.50, CONCAT('Owner ', n), (n % 1000) + 1
FROM seq;