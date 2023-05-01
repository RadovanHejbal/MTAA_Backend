const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const http = require('http');
const axios = require('axios');
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
    
    socket.to(relationId).emit('message', {userId, id: uuid, text: text});
  })
  
  pool.query(`SELECT pushtokens.user_id, pushtokens.token FROM relations JOIN coaches ON (relations.coach_id = coaches.id) JOIN pushtokens ON (relations.user_id = pushtokens.user_id OR coaches.user_id = pushtokens.user_id) WHERE relations.id = '${relationId}'`, (err, response) => {
    if(err || response.rowCount == 0) {
      return;
    }
    const userToPush = response.rows.filter(el => el.user_id != userId);

    if(userToPush.length == 0) {
      return;
    }
    axios.post('https://exp.host/--/api/v2/push/send', {
                to: userToPush[0].token,
                title: 'New Message',
                body: text
    })
  })
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(8000, () => {
  console.log("Listening on port: 8000");
});

