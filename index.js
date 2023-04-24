const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { pool } = require('./db');

app.use(express.json());
app.use(bodyParser.json());

/**** ENDPOINTS FROM DIFFERENT FOLDER */

// USERS
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// MEALS
const mealsRouter = require('./routes/meals');
app.use('/meals', mealsRouter);

// ACTIVITES
const activitiesRouter = require('./routes/activities');
app.use('/activities', activitiesRouter)

// RECEPIES
const recepiesRouter = require('./routes/recepies');
app.use('/recepies', recepiesRouter);

// FORUMS
const forumsRouter = require('./routes/forums');
app.use('/forums', forumsRouter);

// COACHES
const coachesRouter = require('./routes/coaches');
app.use('/coaches', coachesRouter);

// socket real time chatting
io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('join', ({relationId}) => {
    socket.join(relationId);
  })

  socket.on('message', ({text, relationId, userId, uuid, date}) => {

    pool.query(`INSERT INTO coach_messages (id, text, owner_id, relation_id, "date") 
      VALUES ('${uuid}', '${text}', '${userId}', '${relationId}', '${date}') RETURNING *`, (err,response) => {
    if(err) {
      socket.to(relationId).emit('error', {userId, uuid});
      return;
    }
    socket.to(relationId).emit('message', {userId, uuid});
  })
    io.to(relationId).emit('message', {text, userId});
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(8000, () => {
  console.log("Listening on port: 8000");
});

