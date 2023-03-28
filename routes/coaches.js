const express = require('express');
const router = express.Router();
const { pool } = require('../db');


// Get all coaches
router.get('/', (req, res) =>
{
  const coaches_query = `
          SELECT
              Users.name,
              Users.lastname,
              Users.age,
              Coaches.id,
              Coaches.specialization,
              Coaches.description
          FROM Coaches
          JOIN Users ON Users.id = Coaches.user_id
          ;`;
  pool.query(coaches_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows);
  });
});

// Add coach to coach list by admin
router.post('/coach-create', (req, res) =>
{
  const create_coache_query = `
          INSERT INTO Coaches ("id", user_id, specializaion, description)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), ${req.body.user_id}, '${req.body.specializaion}, '${req.body.description}')
          ;`;
  pool.query(create_coache_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

/********** OWNED COACHES ************/
// Get owned trainers
router.get('/owned-coaches', (req, res) =>
{
  const owned_coaches_query = `
          SELECT
              Relations.id,
              Users.name,
              Users.lastname,
              Users.age,
              Coaches.id,
              Coaches.specialization,
              Coaches.description
          FROM Relations
          JOIN Coaches ON Coaches.id = Relations.coach_id
          JOIN Users ON Users.id = Coaches.user_id
          WHERE Relations.user_id = ${req.body.user_id}
          ;`;
  pool.query(owned_coaches_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows);
  });
});

// Add choosen trainer to owned trainer
router.post('/owned-coaches/add-coache', (req, res) =>
{
  const create_trainer_query = `
          INSERT INTO Relations ("id", coach_id, user_id)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), ${req.body.coach_id}, ${req.body.user_id})
          ;`;
  pool.query(create_trainer_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Delete owned trainer
router.delete('/owned-coaches/delete-coache', (req, res) =>
{
  const delete_coache_query = `
          DELETE 
          FROM Relations
          WHERE Relations.id = '${req.body.id}'
          ;`;
  pool.query(delete_coache_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Send message 
router.post('/send-message', (req, res) => {
  pool.query(`INSERT INTO coach_messages (id, text, owner_id, relation_id) 
  VALUES (uuid_in(md5(random()::text || random()::text)::cstring), ${req.body.text}, ${req.body.ownerid}, ${req.body.relationid})`, (err,response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send("OK");
  })
})

// Get all messages from conversation
router.get('/conversation-messages/:relationid', (req, res) => {
  pool.query(`SELECT * FROM coach_messages WHERE relation_id = ${rqe.params.relationid}}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})

// Coach get all clients
router.get('/owned-clients', (req, res) =>
{
  const owned_coaches_query = `
          SELECT
              Relations.id,
              Users.name,
              Users.lastname,
              Users.age
          FROM Relations
          JOIN Users ON Users.id = Coaches.user_id
          WHERE Relations.coach_id = ${req.body.coachid}
          ;`;
  pool.query(owned_coaches_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows);
  });
});

module.exports = router;