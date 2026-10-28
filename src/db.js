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

async function listProjects() {
  const [rows] = await pool.execute(
    'SELECT * FROM projects ORDER BY id DESC'
  );
  return rows;
}

async function searchProjects(keyword) {
  const term = `%${keyword}%`;

  const [rows] = await pool.execute(
    `SELECT * FROM projects
     WHERE COALESCE(project_name, '') LIKE ?
        OR COALESCE(owner_name, '') LIKE ?
     ORDER BY id DESC`,
    [term, term]
  );

  return rows;
}

async function getProjectById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM projects WHERE id = ? LIMIT 1',
    [id]
  );

  return rows.length > 0 ? rows[0] : null;
}

async function testConnection() {
  await pool.query('SELECT 1');
}

module.exports = {
  pool,
  addProject,
  listProjects,
  searchProjects,
  getProjectById,
  testConnection,
};
