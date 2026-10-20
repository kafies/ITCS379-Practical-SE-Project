require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

async function addProject(p) {
  const [result] = await pool.execute(
    `INSERT INTO projects (project_name, latitude, longitude, owner_name, carbon_credits)
     VALUES (?, ?, ?, ?, ?)`,
    [p.project_name, p.latitude, p.longitude, p.owner_name, p.carbon_credits]
  );
  return result.insertId;
}

async function searchByName(name) {
  const [rows] = await pool.execute(
    'SELECT * FROM projects WHERE project_name = ? OR owner_name = ?',
    [name, name]
  );
  return rows;
}

async function minCredits(amount) {
  const [rows] = await pool.execute(
    'SELECT * FROM projects WHERE carbon_credits >= ? ORDER BY carbon_credits DESC',
    [amount]
  );
  return rows;
}

module.exports = { pool, addProject, searchByName, minCredits };
