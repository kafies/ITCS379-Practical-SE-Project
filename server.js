require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = require('./src/api');
const { testConnection } = require('./src/db');

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, async () => {
  console.log(`Juligistry is running at http://localhost:${PORT}`);

  try {
    await testConnection();
    console.log('MySQL database: connected');
  } catch (error) {
    console.error('MySQL database: NOT connected');
    console.error('Check .env and MySQL setup.');
    console.error(error.message);
  }
});