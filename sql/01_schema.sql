CREATE DATABASE IF NOT EXISTS julisgistry
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE julisgistry;

CREATE TABLE IF NOT EXISTS projects (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_name   VARCHAR(255) NULL,
  latitude       DECIMAL(9,6)  NOT NULL,
  longitude      DECIMAL(9,6)  NOT NULL,
  owner_name     VARCHAR(160)  NOT NULL,
  carbon_credits DECIMAL(18,4) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_project_name (project_name),
  INDEX idx_owner_name (owner_name),
  INDEX idx_carbon_credits (carbon_credits),
  CONSTRAINT chk_latitude  CHECK (latitude  BETWEEN -90  AND 90),
  CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_credits   CHECK (carbon_credits > 0)
);
