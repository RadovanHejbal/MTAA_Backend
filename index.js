const { response } = require("express");
const express = require("express");
const app = express();
const { Client } = require("pg");

const pool = new Client({
  user: /*process.env.DATABASE_USER ||*/ 'postgres',
  host: /*process.env.DATABASE_HOST ||*/ '127.0.0.1',
  port: /*process.env.DATABASE_PORT ||*/ 5432,
  database: /*process.env.DATABASE_NAME ||*/ 'mtaa',
  password: /*process.env.DATABASE_PASSWORD ||*/ ''
});

pool.connect();


// Login
app.get('/user/user-login', (req, res) => 
{
  const login_query = `
          SELECT 
              Users.id
          FROM Users
          WHERE Users.username = '${req.body.username}' AND Users.password = '${req.body.password}'
          ;
          `;
  pool.query(login_query, (err, response) => 
  {
    if(err) res.send(err);
    else if(response.rowCount != 0) res.send(response?.rows[0]);
    else res.status(404).json({error: "user not found", message:"user with this username could not be found"});
  })
})

// Registration
app.post('/user/user-registration', (req, res) => 
{
  const registration_query = `
          INSERT INTO Users ("id", username, "password", email, height, weight, gender, "role", age, firstname, lastname, dailykcal) 
          VALUE
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.username}', '${req.body.password}', '${req.body.email}', ${req.body.height}, ${req.body.weight}, '${req.body.gender}', '${req.body.role}', ${req.body.age}, '${req.body.firstname}', '${req.body.lastname}', ${req.body.dailykcal})
          ;`;
  pool.query(registration_query, (err) => 
  {
    if(err) res.send(err);
    else res.send("OK");
  })
})

// Create recepie
app.post('/recepie/recepie-create', (req, res) =>
{
  const create_recepie_query = `

  `;
  pool.query(create_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  })
})

// Delete recepie
app.delete('/recepie/recepie-delete', (req, res) =>
{
  const delete_recepie_query = `
  
  `;
  pool.query(delete_recepie_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  })
})

// Create forum
app.post('/forum/forum-create', (req, res) =>
{
  const create_forum_query = `

  `;
  pool.query(create_forum_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  })
})

// Delete forum
app.delete('/forum/forum-delete', (req, res) =>
{
  const delete_forum_query = `
  
  `;
  pool.query(delete_forum_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  })
})

// Add trainer
app.post('/trainer/trainer-create', (req, res) =>
{
  const create_trainer_query = `

  `;
  pool.query(create_trainer_query, (err) =>
  {
    if(err) res.send(err);
    else res.send("OK");
  })
})




app.get('/meals/:minimumcalorie', (req, res) => {
  pool.query(`SELECT * FROM meals WHERE ${req.params.minimumcalorie} < meals.kcal`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})


// EXAMPLE */

app.listen(8000, () => {
  console.log("Listening on port: 8000");
});
