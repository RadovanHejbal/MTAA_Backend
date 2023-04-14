const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', (req, res) =>
{
  const meals_query = `
          SELECT 
              Meals.id,
              Meals.title
          FROM Meals
          ;`;
  pool.query(meals_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows);
  });
});

// meal details
router.get('/details/:id', (req, res) => {
  pool.query(`SELECT * FROM meals WHERE id = ${req.params.id}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

// Add choosen meal to owned meals
router.post('/owned_meals/add', (req, res) =>
{
  const add_meal_query = `
          INSERT INTO Owned_meals ("id", owner_id, meal_id, grams, "date")
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), ${req.body.owner_id}, ${req.body.meal_id}, ${req.body.grams}, ${req.body.date});
          ;`;
  pool.query(add_meal_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Delete choosen meal from owned meals
router.delete('/owned-meals/delete', (req, res) =>
{
  const delete_meal_query = `
          DELETE 
          FROM Owned_meals
          WHERE Owned_meals.id = '${req.body.id}'
          ;`;
  pool.query(delete_meal_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});


module.exports = router;