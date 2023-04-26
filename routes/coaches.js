const express = require('express');
const router = express.Router();
const { pool } = require('../db');


// Get all coaches
router.get('/', (req, res) =>
{
  const coaches_query = `
          SELECT
              Users.firstname,
              Users.lastname,
              Users.age,
              Coaches.id,
              Coaches.specializaion,
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
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.user_id}', '${req.body.specializaion}', '${req.body.description}')
          ;`;
  pool.query(create_coache_query, (err) =>
  {
    if(err) res.status(404).json(err);
    else res.send("OK");
  });
});

/********** OWNED COACHES ************/
// Get owned trainers
router.get('/owned-coaches/:id', (req, res) =>
{
  const owned_coaches_query = `
          SELECT
              relations.id,
              users.firstname,
              users.lastname,
              users.age,
              coaches.specializaion
          FROM relations
          JOIN coaches ON coaches.id = relations.coach_id
          JOIN users ON users.id = coaches.user_id
          WHERE relations.user_id = '${req.params.id}'
          ;`;
  pool.query(owned_coaches_query, (err, response) =>
  {
    if(err) {
      res.status(404).json(err);
    }
    else res.send(response?.rows);
  });
});

// Add choosen trainer to owned trainer
router.post('/owned-coaches/add', (req, res) =>
{
  const create_trainer_query = `
          INSERT INTO Relations ("id", coach_id, user_id)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.coachId}', '${req.body.userId}')
          ;`;
  pool.query(create_trainer_query, (err) =>
  {
    if(err) res.status(410).json(err);
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
  console.log(req.params.relationid);
  pool.query(`SELECT * FROM coach_messages WHERE relation_id = '${req.params.relationid}' ORDER BY coach_messages.date`, (err, response) => {
    if(err) {
      res.status(404).json(err);
      return;
    }
    res.send(response?.rows);
  })
})

// Coach get all clients
router.get('/owned-clients/:id', (req, res) =>
{
  console.log(req.params.id);
  const owned_coaches_query = `
          SELECT
              Relations.id,
              Users.firstname,
              Users.lastname,
              Users.age
          FROM Relations
          JOIN Users ON Users.id = Relations.user_id
          WHERE Relations.coach_id = '${req.params.id}'
          ;`;
  pool.query(owned_coaches_query, (err, response) =>
  {
    if(err) res.status(410).json(err);
    else res.send(response?.rows);
  });
});

// Get relations
router.get('/relations/:userId', (req, res) => {
  pool.query(`SELECT coach_id from relations where user_id = '${req.params.userId}';`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})

router.get('/is-coach/:id', (req, res) => {
  pool.query(`SELECT * FROM coaches WHERE user_id = '${req.params.id}'`, (err, response) => {
    if(err || response.rowCount == 0) {
      res.status(404).json(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

router.get(`/details/:id`, (req, res) => {
  pool.query(`SELECT coaches.id, coaches.specializaion, coaches.description, users.firstname, users.lastname, users.age FROM coaches JOIN users ON (coaches.user_id = users.id) WHERE coaches.id = '${req.params.id}'`, (err, response) => {
    if(err) {
      res.status(404).json(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

module.exports = router;