const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// search for activities
router.get('/', (req, res) => {
  pool.query(`SELECT activities.id, activities.title FROM activities`, (err, response) => {
    if(err) {
      res.status(410).json(err);
      return;
    }
    res.send(response?.rows);
  })
})


// details about activity
router.get('/details/:id', (req, res) => {
    pool.query(`SELECT * FROM activities WHERE id = '${req.params.id}'`, (err, response) => {
      if(err) {
        res.status(410).json(err);
        return;
      }
      res.send(response?.rows[0]);
    })
  })
  
  // add chosen activity to owned activies
  router.post('/add', (req, res) =>
  {
    const date = new Date(req.body.date);
    const formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    const add_activity = `
            INSERT INTO Owned_activities ("id", owner_id, activity_id, time_amount, "date")
            VALUES
                (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.ownerId}', '${req.body.activityId}', ${req.body.time}, '${formattedDate}')
            RETURNING *;`;
    pool.query(add_activity, (err, response) =>
    {
      if(err) res.status(410).json(err);
      else res.send(response.rows[0]);
    });
  });
  
  // delete owned activity
  router.delete('/owned-activity/delete/:id', (req, res) =>
  {
    const deleteActivity = `
            DELETE 
            FROM owned_activities
            WHERE id = '${req.params.id}'
            ;`;
    pool.query(deleteActivity, (err) =>
    {
      if(err) res.send(err);
      else res.send("OK");
    });
  });

  module.exports = router;