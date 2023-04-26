const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all recepies
router.get('/', (req, res) =>
{
  const recepies_query = `
          SELECT *
          FROM Recepies
          ORDER BY recepies.upvotes DESC
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
  var image = null;
  if (req.body.picture != null) {
    image = `'${req.body.picture}'`
  }
  const create_recepie_query = `
          INSERT INTO Recepies ("id", title, ingrediences, process, owner_id, upvotes, picture) 
          VALUES
            (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.title}', null, '${req.body.process}', '${req.body.ownerId}', 0, ${image})
          ;`;
  pool.query(create_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Update votes
router.put('/vote-update/:recepieId', (req, res) => {
  var voteUpdate = `UPDATE recepies SET upvotes = ${req.body.votes} WHERE "id" = '${req.params.recepieId}'`;
  pool.query(voteUpdate, (err, response) =>{
    if(err){
      res.send(err);
      return;
    }
    res.send("OK");
  });
});

// Delete recepie
router.delete('/recepie-delete/:id', (req, res) =>
{
  const delete_recepie_query = `
          DELETE 
          FROM Recepies
          WHERE Recepies.id = '${req.params.id}'
          ;`;
  pool.query(delete_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

module.exports = router;