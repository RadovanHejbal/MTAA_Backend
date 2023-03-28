const express = require('express');
const router = express.Router();
const { pool } = require('../db');


// details about activity
router.get('/details/:id', (req, res) => {
    pool.query(`SELECT * FROM activities WHERE id = ${req.params.id}`, (err, response) => {
      if(err) {
        res.send(err);
        return;
      }
      res.send(response?.rows[0]);
    })
  })
  
  // add chosen activity to owned activies
  router.post('/owned/add-activity', (req, res) =>
  {
    const add_activity = `
            INSERT INTO Owned_meals ("id", owner_id, activity_id, time_amount, "date")
            VALUES
                (uuid_in(md5(random()::text || random()::text)::cstring), ${req.body.owner_id}, ${req.body.activityid}, ${req.body.time}, ${req.body.date});
            ;`;
    pool.query(add_activity, (err) =>
    {
      if(err) res.send(err);
      else res.send("OK");
    });
  });
  
  // delete owned activity
  router.delete('/owned/delete-activity', (req, res) =>
  {
    const deleteActivity = `
            DELETE 
            FROM owned_activities
            WHERE id = '${req.body.id}'
            ;`;
    pool.query(deleteActivity, (err) =>
    {
      if(err) res.send(err);
      else res.send("OK");
    });
  });

  module.exports = router;