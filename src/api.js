// src/api.js
const path = require('path');
const express = require('express');

const {
  addProject,
  listProjects,
  searchProjects,
  getProjectById,
  testConnection,
} = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Project root is one directory above src/
const ROOT_DIR = path.join(__dirname, '..');

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check the database connection
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();

    res.json({
      ok: true,
      database: 'connected',
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    res.status(500).json({
      ok: false,
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Validate the registration form
function validateProject(body) {
  const project_name =
    typeof body.project_name === 'string'
      ? body.project_name.trim()
      : '';

  const owner_name =
    typeof body.owner_name === 'string'
      ? body.owner_name.trim()
      : '';

  const latitude =
    body.latitude === '' ||
    body.latitude === undefined ||
    body.latitude === null
      ? NaN
      : Number(body.latitude);

  const longitude =
    body.longitude === '' ||
    body.longitude === undefined ||
    body.longitude === null
      ? NaN
      : Number(body.longitude);

  const carbon_credits =
    body.carbon_credits === '' ||
    body.carbon_credits === undefined ||
    body.carbon_credits === null
      ? NaN
      : Number(body.carbon_credits);

  if (!owner_name) {
    return {
      error: "Credit owner's name is required.",
    };
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return {
      error: 'Latitude must be between -90 and 90.',
    };
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return {
      error: 'Longitude must be between -180 and 180.',
    };
  }

  if (!Number.isFinite(carbon_credits) || carbon_credits <= 0) {
    return {
      error: 'Carbon credits must be greater than 0.',
    };
  }

  return {
    value: {
      project_name: project_name || null,
      latitude,
      longitude,
      owner_name,
      carbon_credits,
    },
  };
}

// Register a new carbon-credit project
app.post('/api/projects', async (req, res) => {
  const validation = validateProject(req.body || {});

  if (validation.error) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  try {
    const id = await addProject(validation.value);
    const project = await getProjectById(id);

    return res.status(201).json({
      id,
      project,
    });
  } catch (error) {
    console.error('POST /api/projects failed:', error);

    return res.status(500).json({
      error: 'The project could not be saved to the database.',
    });
  }
});

// List all projects or search projects using ?q=keyword
app.get('/api/projects', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();

    const projects = q
      ? await searchProjects(q)
      : await listProjects();

    return res.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('GET /api/projects failed:', error);

    return res.status(500).json({
      error: 'Projects could not be loaded from the database.',
    });
  }
});

// Retrieve a project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found.',
      });
    }

    return res.json({ project });
  } catch (error) {
    console.error('GET /api/projects/:id failed:', error);

    return res.status(500).json({
      error: 'The project could not be loaded.',
    });
  }
});

// Serve index.html, CSS, JavaScript, images, and modules/ from the project root
app.use(express.static(ROOT_DIR));

// For frontend routes not found as static files, return the homepage.
// Do not turn unknown API requests into HTML responses.
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Return JSON for unknown API routes and other unmatched requests
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found.',
  });
});

// Start the server
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Juligistry is running at http://localhost:${PORT}`);

    try {
      await testConnection();
      console.log('MySQL database: connected');
    } catch (error) {
      console.log('MySQL database: NOT connected');
      console.log('Check your .env file and MySQL setup.');
      console.error(error.message);
    }
  });
}

module.exports = app;