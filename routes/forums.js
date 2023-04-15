const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all forums
router.get('/', (req, res) =>
{
  const forums_query = `
          SELECT *
          FROM Forum_questions
          ORDER BY Forum_questions.upvotes DESC
          ;`;
  pool.query(forums_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows);
  });
});

// Create forum
router.post('/create', (req, res) =>
{
  const opened_at = new Date(req.body.opened_at);
  const formattedDate = new Date(opened_at.getTime() - (opened_at.getTimezoneOffset() * 60000)).toISOString();
  const create_forum_query = `
          INSERT INTO Forum_questions ("id", title, upvotes, owner_id, opened_at, closed_at, theme_id)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.title}', 0, '${req.body.owner_id}', '${formattedDate}', null, null)
          ;`;
  pool.query(create_forum_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Closing forum question
router.put('/close/:date/:forumid', (req, res) => {
  pool.query(`UPDATE forum_questions SET closed_at = ${req.params.date} WHERE id = ${req.params.forumid}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send("OK");
  });
});

router.put('/vote-update/:forumId', (req, res) => {
  var voteUpdate = `UPDATE forum_questions SET upvotes = ${req.body.votes} WHERE "id" = '${req.params.forumId}'`;
  pool.query(voteUpdate, (err, response) =>{
    if(err){
      res.send(err);
      return;
    }
    res.send("OK");
  });
});

// Add message to forum_question
router.post('/add-message', (req, res) => {
  var coach_id = null;
  if(req.body.coache_id != "") coach_id = `'${req.body.coache_id}'`;
  pool.query(`INSERT INTO forum_message ("id", forum_question_id, user_id, text, coach_id)
              VALUES (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.forumid}', '${req.body.userid}', '${req.body.text}', ${coach_id})`, (err, response) => {
                if(err) {
                  res.send(err);
                  return;
                }
                res.send("OK");
              })
})

// Get forum_question messages by order
router.get('/get-messages/:forumquestionid', (req,res) => {
  pool.query(`SELECT forum_message.id, forum_message.text, forum_message.coach_id, users.username, forum_message.user_id FROM forum_message
  JOIN users ON (users.id = forum_message.user_id)
  WHERE forum_question_id = '${req.params.forumquestionid}'`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})

module.exports = router;