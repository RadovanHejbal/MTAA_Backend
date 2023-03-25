const { response } = require("express");
const express = require("express");
const app = express();
const { Client } = require("pg");

const pool = new Client({
  user: /*process.env.DATABASE_USER ||*/ 'postgres',
  host: /*process.env.DATABASE_HOST ||*/ '127.0.0.1',
  port: /*process.env.DATABASE_PORT ||*/ 5432,
  database: /*process.env.DATABASE_NAME ||*/ 'mtaa',
  password: /*process.env.DATABASE_PASSWORD ||*/ 'password'
});
pool.connect();

/********** USERS **********/
// Login
app.get('/users/user-login', (req, res) => 
{
  const login_query = `
          SELECT 
              Users.id
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

// Registration
app.post('/users/user-registration', (req, res) => 
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



/*********** RECEPIES *************/
// Get all recepies
app.get('/recepies', (req, res) =>
{
  const recepies_query = `
          SELECT *
          FROM Recepies
  `;
  pool.query(recepies_query, (err, response) =>
  {
    if(err) res.send(err);
    else if (response.rowCount != 0) res.send(response?.rows);
    else res.status(404).json({error: "recepies empty", message:"There is no posted recepies!"});
  });
});

// Create recepie
app.post('/recepies/recepie-create', (req, res) =>
{
  const create_recepie_query = `
          INSERT INTO Recepies ("id", title, ingrediences, process, upvotes, pictrue) 
          VALUES
            (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.title}', '${req.body.ingrediences}', '${req.body.process}', 0, '${req.body.picture}')
          ;`;
  pool.query(create_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});

// Delete recepie
app.delete('/recepies/recepie-delete', (req, res) =>
{
  const delete_recepie_query = `
          DELETE 
          FROM Recepies
          WHERE Recepies.id = '${req.body.id}'
          ;`;
  pool.query(delete_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});





/*********** FORUM *************/
// Get all forums
app.get('/forums', (req, res) =>
{
  const forums_query = `
          SELECT *
          FROM Forum_questions
          ;`;
  pool.query(forums_query, (err, response) =>
  {
    if(err) res.send(err);
    else if (response.rowCount != 0) res.send(response?.rows);
    else res.status(404).json({error: "forums empty", message:"There is no posted forums!"});
  });
});

// Create forum
app.post('/forums/forum-create', (req, res) =>
{
  const create_forum_query = `
          INSERT INTO Forum_questions ("id", title, upvotes, owner_id, opened_at, closed_at, theme_id)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.title}', 0, ${req.body.owner_id}, ${req.body.opened_at}, ${req.body.closed_at}, ${req.body.theme_id})
          ;`;
  pool.query(create_forum_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});






/*********** TRAINERS *************/
// Get all trainers
app.get('/trainers', (req, res) =>
{
  const trainer_query = `
          SELECT *
          FROM Coaches
          ;`;
  pool.query(trainer_query, (err, response) =>
  {
    if(err) res.send(err);
    else if (response.rowCount != 0) res.send(response?.rows);
    else res.status(404).json({error: "trainers empty", message:"There is no registered trainers!"});
  });
});

// Add trainer
app.post('/trainers/trainer-create', (req, res) =>
{
  const create_trainer_query = `
          INSERT INTO Coaches ("id", user_id, specializaion, description)
          VALUES
              (uuid_in(md5(random()::text || random()::text)::cstring), ${req.body.user_id}, '${req.body.specializaion}, '${req.body.description}')
          ;`;
  pool.query(create_trainer_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  });
});


app.get('/users/daily/:date/:userid', (req, res) => {
  pool.query(`WITH calc_meals as (SELECT (meals.kcal * owned_meals.grams) as kcal, (meals.protein * owned_meals.grams) as protein,
(meals.fat * owned_meals.grams) as fat, (meals.carbohydrates * owned_meals.grams) as carbs, meals.title,
owned_meals.id, owned_meals.grams, owned_meals.owner_id
FROM owned_meals
JOIN meals ON (owned_meals.meal_id = meals.id)
WHERE owned_meals.owner_id = ${req.params.userid} AND owned_meals.date = ${req.params.date}
)
SELECT ARRAY_AGG(JSON_BUILD_OBJECT('id', calc_meals.id, 'title', calc_meals.title, 'kcal', calc_meals.kcal,
'protein', calc_meals.protein, 'fat', calc_meals.fat, 'carbs', calc_meals.carbs)), SUM(calc_meals.kcal),
SUM(calc_meals.protein), SUM(calc_meals.fat), SUM(calc_meals.carbs)
FROM calc_meals
GROUP BY calc_meals.owner_id`, (err, response) => {
  if(err) {
    res.send(err);
    return;
  }
  res.send(response.rows[0]);
})
})



app.get('/meals/:minimumcalorie', (req, res) => {
  pool.query(`SELECT * FROM meals WHERE ${req.params.minimumcalorie} < meals.kcal`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  });
});


// EXAMPLE */

app.listen(8000, () => {
  console.log("Listening on port: 8000");
});
