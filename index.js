/*
  POZNAMKY:
  -premenovat vo coach_messages conversationid na relationid a vymazat tabulku conversations
  -pridat date do coach_messages
  -prerobit search mealov a spravit search activities
*/


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

// Daily kcal, protain, carbs, fat, activities for calcul
app.get('/users/daily/:date/:userid', (req, res) =>
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
          )
          SELECT 
              ARRAY_AGG(JSON_BUILD_OBJECT('id', calc_meals.id, 'title', calc_meals.title, 'kcal', calc_meals.kcal,
                                          'protein', calc_meals.protein, 'fat', calc_meals.fat, 'carbs', calc_meals.carbs)), 
              SUM(calc_meals.kcal),
              SUM(calc_meals.protein), 
              SUM(calc_meals.fat), 
              SUM(calc_meals.carbs)
          FROM calc_meals
          GROUP BY calc_meals.owner_id
          ;`;
  pool.query(daily_query, (err, response) =>
  {
    if(err) res.send(err);
    else res.send(response?.rows[0]);
  });
});





/*********** MEALS *************/
// Get meals id and name -> for searchbar
app.get('/meals', (req, res) =>
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
app.get('/meals/details/:id', (req, res) => {
  pool.query(`SELECT * FROM meals WHERE id = ${req.params.id}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

// Add choosen meal to owned meals
app.post('/meals/owned_meals/add-meal', (req, res) =>
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
app.delete('/meals/owned-meals/delete-meal', (req, res) =>
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


/*********** ACTIVITIES ************/
app.get('/activities/details/:id', (req, res) => {
  pool.query(`SELECT * FROM activities WHERE id = ${req.params.id}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

// add chosen activity to owned activies
app.post('/activities/owned/add-activity', (req, res) =>
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

// delete owned meal
app.delete('/activities/owned/delete-activity', (req, res) =>
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
    else res.send(response?.rows);
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
    else res.send(response?.rows);
  });
});

// Create forum
app.post('/forums/forum-create', (req, res) =>
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
app.update('/forums/forum-close/:date/:forumid', (req, res) => {
  pool.query(`UPDATE forum_questions SET closed_at = ${req.params.date} WHERE id = ${req.params.forumid}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send("OK");
  })
})

// Add message to forum_question
app.post('/forums/add-message', (req, res) => {
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
app.get('/forums/get-messages/:forumquestionid', (req,res) => {
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





/*********** COACHES *************/
// Get all coaches
app.get('/coaches', (req, res) =>
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
app.post('/coaches/coache-create', (req, res) =>
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
app.get('/coaches/owned_coaches', (req, res) =>
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
app.post('/coaches/owned_coaches/add-coache', (req, res) =>
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
app.delete('/coaches/owned_coaches/delete-coache', (req, res) =>
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
app.post('/coaches/send-message', (req, res) => {
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
app.get('/coaches/conversation-messages/:relationid', (req, res) => {
  pool.query(`SELECT * FROM coach_messages WHERE relation_id = ${rqe.params.relationid}}`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})

// Coach get all clients
app.get('/coaches/owned_coaches', (req, res) =>
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





app.listen(8000, () => {
  console.log("Listening on port: 8000");
});
