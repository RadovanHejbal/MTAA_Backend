const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/login', (req, res) => 
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
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.username}', '${req.body.password}', '${req.body.email}', ${req.body.height}, ${req.body.weight}, '${req.body.gender}', '${req.body.role}', ${req.body.age}, '${req.body.firstname}', '${req.body.lastname}', ${req.body.dailykcal})
          ;`;
  pool.query(registration_query, (err) => 
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Username change
router.put('/change-username', (req, res) => {
    console.log(req.body.username, req.body.id);
    pool.query(`UPDATE users SET username = '${req.body.username}' WHERE id = '${req.body.id}';`, (err, response) => {
      if(err) {
        res.send(err);
        return;
      }
      res.send("OK");
    })
  })
  
  // Daily kcal, protain, carbs, fat, activities for calcul
  router.get('/daily/:date/:userid', (req, res) =>
  {
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
                WHERE owned_meals.owner_id = ${req.params.userid} AND owned_meals.date = ${req.params.date}
            ), calc_activities AS
            (
                SELECT
                (
                    (activities.kcal * owned_activities.time_amount) AS kcal,
                    activities.title,
                    owned_activities.id,
                    owned_activities.time_amount,
                    owned_activities.owner_id
                )
                FROM owned_activities
                JOIN activities ON activities.id = owned_activities.activity_id
                WHERE owned_activities.owner_id = ${req.params.userid} AND owned_activities.date = ${req.params.date}
            )
            SELECT 
                ARRAY_AGG(JSON_BUILD_OBJECT('id', calc_meals.id, 'title', calc_meals.title, 'kcal', calc_meals.kcal, 'grams', calc_meals.grams,
                                            'protein', calc_meals.protein, 'fat', calc_meals.fat, 'carbs', calc_meals.carbs)), 
                ARRAY_AGG(JSON_BUILD_OBJECT('id', calc_activities.id, 'title', calc_activities.title, 'kcal', calc_activities.kcal, 
                                            'time_amount', calc_activities.time_amount),
                SUM(calc_activities.kcal),
                SUM(calc_meals.kcal),
                SUM(calc_meals.protein), 
                SUM(calc_meals.fat), 
                SUM(calc_meals.carbs)
            FROM calc_meals
            JOIN calc_activities ON calc_activities.owner_id = calc_meals.owner_id
            GROUP BY calc_meals.owner_id
            ;`;
    pool.query(daily_query, (err, response) =>
    {
      if(err) res.send(err);
      else res.send(response?.rows[0]);
    });
  });

  module.exports = router;