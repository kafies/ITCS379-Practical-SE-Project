USE julisgistry;

-- name search
SELECT * FROM projects WHERE project_name = 'Northern Forest Restoration';
SELECT * FROM projects WHERE owner_name = 'Oneal';
SELECT * FROM projects WHERE owner_name LIKE 'Exam%';   -- starts with

-- carbon credits
SELECT * FROM projects WHERE carbon_credits >= 100 ORDER BY carbon_credits DESC;
SELECT * FROM projects WHERE carbon_credits BETWEEN 100 AND 2500;

-- prove the indexes are used
EXPLAIN SELECT * FROM projects WHERE owner_name = 'Oneal';
EXPLAIN SELECT * FROM projects WHERE carbon_credits >= 2000;