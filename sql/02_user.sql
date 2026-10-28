CREATE USER 'julis_app'@'localhost' IDENTIFIED BY 'MyPass123';

GRANT SELECT, INSERT ON julisgistry.projects TO 'julis_app'@'localhost';