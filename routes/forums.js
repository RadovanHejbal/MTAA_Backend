const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all forums
router.get('/', (req, res) =>
{
  const forums_query = `
          SELECT *
          FROM Forum_questions
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
  const create_forum_query = `
          INSERT INTO Forum_questions ("id", title, upvotes, owner_id, opened_at, theme_id)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.title}', 0, ${req.body.owner_id}, ${req.body.opened_at}, ${req.body.theme_id})
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
  })
})

// Add message to forum_question
router.post('/add-message', (req, res) => {
  pool.query(`INSERT INTO forum_messages ("id", forum_question_id, user_id, text, coach_id)
              VALUES (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.forumid}', '${req.body.userid}', '${req.body.text}', ${req.body.coachid})`, (err, response) => {
                if(err) {
                  res.send(err);
                  return;
                }
                res.send("OK");
              })
})

// Get forum_question messages by order
router.get('/get-messages/:forumquestionid', (req,res) => {
  pool.query(`SELECT forum_messages.id, users.username, forum_messages.text, forum_messages.coach_id FROM forum_messages
  JOIN users ON (users.id = forum_messages.user_id)
  WHERE forum_question_id = ${req.params.forumquestionid}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})

module.exports = router;