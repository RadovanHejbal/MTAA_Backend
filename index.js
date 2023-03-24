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
app.get('/login/:username/:password', (req, res) => {
  pool.query(`
          SELECT 
              Users.id
          FROM Users
          WHERE Users.username = '${req.params.username}' AND Users.password = '${req.params.password}'
          ;`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

// Registration
app.get('/registration/:username/:password/:email/:height/:weight/:gender/:role/:age/:firstname/:lastname/:dailykcal', (req, res) => {
  pool.query(`
        INSERT INTO Users ("id", username, "password", email, height, weight, gender, "role", age, firstname, lastname, dailykcal) 
        VALUE
            (uuid_in(md5(random()::text || random()::text)::cstring), '${req.paarams.username}', '${req.params.password}', '${req.params.email}', ${req.params.height}, ${req.params.weight}, '${req.params.gender}', '${req.params.role}', ${req.params.age}, '${req.params.firstname}', '${req.params.lastname}', ${req.params.dailykcal})
        ;`, (err, response) => {
    if(err){
      res.send(err);
      return;
    }
    res.send("Succesfully regitered");
  }

  )
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
