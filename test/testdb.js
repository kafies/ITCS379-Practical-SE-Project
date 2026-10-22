const { addProject, searchByName, minCredits, pool } = require('../src/db');

(async () => {
  const id = await addProject({
    project_name: 'Test Project',
    latitude: 13.75,
    longitude: 100.5,
    owner_name: 'Tester',
    carbon_credits: 500,
  });
  console.log('Inserted id:', id);
  console.log(await searchByName('Tester'));
  console.log(await minCredits(100));
  await pool.end();
})();
