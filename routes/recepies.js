const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all recepies
router.get('/', (req, res) =>
{
  const recepies_query = `
          SELECT *
          FROM Recepies
  `;
  pool.query(recepies_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows);
  });
});

// Create recepie
router.post('/recepie-create', (req, res) =>
{
  const create_recepie_query = `
          INSERT INTO Recepies ("id", title, ingrediences, process, upvotes, pictrue) 
          VALUES
            (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.title}', '${req.body.ingrediences}', '${req.body.process}', 0, '${req.body.picture}')
          ;`;
  pool.query(create_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Delete recepie
router.delete('/recepie-delete', (req, res) =>
{
  const delete_recepie_query = `
          DELETE 
          FROM Recepies
          WHERE Recepies.id = '${req.body.id}'
          ;`;
  pool.query(delete_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

module.exports = router;