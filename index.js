/*
  POZNAMKY:
  -premenovat vo coach_messages conversationid na relationid a vymazat tabulku conversations
  -pridat date do coach_messages
  -prerobit search mealov a spravit search activities
*/

const bodyParser = require('body-parser');
const express = require("express");
const app = express();

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



app.listen(8000, () => {
  console.log("Listening on port: 8000");
});

