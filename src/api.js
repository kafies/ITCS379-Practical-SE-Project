// src/server.js
const express = require('express');
const db = require('./db'); // Uses your existing src/db.js connection
const { requireNonEmptyBoxes } = require('./validation');

const app = express();

// Middleware to parse typed JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 1. API Endpoint to receive typed form data (e.g., from register.html)
 * Validates that projectName, studentName, and description are not empty.
 */
app.post(
  '/api/projects',
  requireNonEmptyBoxes(['projectName', 'studentName', 'description']),
  async (req, res) => {
    const { projectName, studentName, description } = req.body;

    try {
      const sql = `
        INSERT INTO projects (project_name, student_name, description)
        VALUES (?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        projectName.trim(),
        studentName.trim(),
        description.trim(),
      ]);

      return res.status(201).json({
        success: true,
        message: 'Project data received and saved successfully.',
        projectId: result.insertId,
      });
    } catch (err) {
      console.error('Error saving project:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error while saving project data.',
      });
    }
  }
);

/**
 * 4. Backend Code to Find the Project (e.g., from modules/search.js)
 * Validates that the 'searchQuery' box is not empty, then searches the database.
 */
app.get(
  '/api/projects/search',
  requireNonEmptyBoxes(['searchQuery']),
  async (req, res) => {
    const { searchQuery } = req.query;
    const keyword = `%${searchQuery.trim()}%`;

    try {
      const sql = `
        SELECT * FROM projects
        WHERE project_name LIKE ?
           OR student_name LIKE ?
           OR description LIKE ?
      `;
      const [rows] = await db.query(sql, [keyword, keyword, keyword]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No matching projects found.',
          projects: [],
        });
      }

      return res.status(200).json({
        success: true,
        count: rows.length,
        projects: rows,
      });
    } catch (err) {
      console.error('Database search error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error while searching for the project.',
      });
    }
  }
);

/**
 * Find a single project by exact ID
 */
app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found.',
      });
    }

    return res.status(200).json({
      success: true,
      project: rows[0],
    });
  } catch (err) {
    console.error('Error finding project by ID:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
});

// Start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;