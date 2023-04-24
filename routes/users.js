const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.post('/login', (req, res) => 
{
  const login_query = `
          SELECT 
              *
          FROM Users
          WHERE Users.username = '${req.body.username}' AND Users.password = '${req.body.password}'
          ;`;
  pool.query(login_query, (err, response) => 
  {
    if(err) res.send(err);
    else if(response.rowCount != 0) res.send(response?.rows[0]);
    else res.status(404).json({error: "user not found", message:"Wrong username or password!"});
  });
});

router.post('/registration', (req, res) => 
{
  const registration_query = `
          INSERT INTO Users ("id", username, "password", email, height, weight, gender, "role", age, firstname, lastname, dailykcal) 
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.username}', '${req.body.password}', '${req.body.email}', ${req.body.height}, ${req.body.weight}, '${req.body.gender}', 'user', ${req.body.age}, '${req.body.firstname}', '${req.body.lastname}', 0)
          ;`;
  pool.query(registration_query, (err) => 
  {
    if(err) res.status(469).json(err);
    else res.send("OK");
  });
});
  
// Daily kcal, protain, carbs, fat from meals
router.get('/daily/meals/:date/:userid', (req, res) =>
{
  const date = new Date(req.params.date);
  const formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  const daily_query = `
  WITH calc_meals AS 
  (
      SELECT 
          (meals.kcal * owned_meals.grams) AS kcal, 
          (meals.protein * owned_meals.grams) AS protein,
          (meals.fat * owned_meals.grams) AS fat, 
          (meals.carbohydrates * owned_meals.grams) AS carbs, 
          meals.title,
          owned_meals.id, 
          owned_meals.grams, 
          owned_meals.owner_id
      FROM owned_meals
      JOIN meals ON (owned_meals.meal_id = meals.id)
      WHERE owned_meals.owner_id = '${req.params.userid}' AND DATE_TRUNC('day'::text, owned_meals.date) = DATE_TRUNC('day'::text, CAST('${formattedDate}' AS DATE))
  )
  SELECT 
      ARRAY_AGG(JSON_BUILD_OBJECT('id', calc_meals.id, 'title', calc_meals.title, 'kcal', calc_meals.kcal, 'grams', calc_meals.grams,
                                  'protein', calc_meals.protein, 'fat', calc_meals.fat, 'carbs', calc_meals.carbs)) AS meals, 
      SUM(calc_meals.kcal) as kcal,
      SUM(calc_meals.protein) as protein, 
      SUM(calc_meals.fat) as fat, 
      SUM(calc_meals.carbs) as carbs
  FROM calc_meals
  GROUP BY calc_meals.owner_id
  ;`;
  pool.query(daily_query, (err, response) =>
  {
    if(err) res.status(404).json(err);
    else {
      res.send(response?.rows[0]);
    };
  });
});

// daily kcal from activities
router.get('/daily/activities/:date/:userid', (req, res) =>
{
  const date = new Date(req.params.date);
  const formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  const daily_query = `
  WITH calc_activities AS
  (
      SELECT
          (activities.kcal * owned_activities.time_amount) AS act_kcal,
          activities.title,
          owned_activities.id,
          owned_activities.time_amount,
          owned_activities.owner_id
      FROM owned_activities
      JOIN activities ON activities.id = owned_activities.activity_id
      WHERE owned_activities.owner_id = '${req.params.userid}' AND DATE_TRUNC('day'::text, owned_activities.date) = DATE_TRUNC('day'::text, CAST('${formattedDate}' AS DATE))
  )
  SELECT 
      ARRAY_AGG(JSON_BUILD_OBJECT('id', calc_activities.id, 'title', calc_activities.title, 'kcal', calc_activities.act_kcal, 
                                  'time_amount', calc_activities.time_amount)) as activities,
      SUM(calc_activities.act_kcal) as kcal
  FROM calc_activities
  GROUP BY calc_activities.owner_id
  ;`;
  pool.query(daily_query, (err, response) =>
  {
    if(err) res.status(404).json(err);
    else {
      res.send(response?.rows[0]);
    };
  });
});

// Profile changes
router.put('/update-user/:id', (req, res) => {
  const updateQuery = `
  UPDATE users 
  SET 
      username = '${req.body.username}',
      email = '${req.body.email}',
      "password" = '${req.body.password}',
      height = ${req.body.height},
      weight = ${req.body.weight}
  WHERE "id" = '${req.params.id}'
  ;`
  pool.query(updateQuery, (err, response) => {
    if(err) {
      res.status(410).json(err);
      return;
    }
    res.send("OK");
  })
})

module.exports = router;