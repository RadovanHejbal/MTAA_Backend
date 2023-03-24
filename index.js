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
app.get('/fitme/login', (req, res) => 
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
    if(err) 
    {
      res.send(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

// Registration
app.post('/fitme/registration', (req, res) => 
{
  const registration_query = `
          INSERT INTO Users ("id", username, "password", email, height, weight, gender, "role", age, firstname, lastname, dailykcal) 
          VALUE
              (uuid_in(md5(random()::text || random()::text)::cstring), '${req.body.username}', '${req.body.password}', '${req.body.email}', ${req.body.height}, ${req.body.weight}, '${req.body.gender}', '${req.body.role}', ${req.body.age}, '${req.body.firstname}', '${req.body.lastname}', ${req.body.dailykcal})
          ;`;
  pool.query(registration_query, (err, response) => 
  {
    if(err)
    {
      res.send(err);
      return;
    }
    res.send("Succesfully regitered");
  })
})

// Check if username already exists
app.get('/fitme/username-check', (req, res) =>
{
  const username_check_query = `
          SELECT 
              Users.username
          FROM Users
          WHERE Users.username = '${req.query.username}';
          `;
  pool.query(username_check_query, (err, response) =>
  {
    if(err)
    {
      res.send(err)
      return;
    }
    if (response == null)
      res.send("Cool, username not exist a nieco neviem kokot");
    else
      res.send("JEBEK.. LOL");
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
