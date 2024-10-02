var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// GraphQL
const graphqlSchema = require('./graphql/schema');
const { graphqlHTTP } = require('express-graphql');
const {authModMiddleware} = require("./middleware/auth");
const atlasCreds = require('./atlasCreds');

// everyday
require('./scheduler');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var rentRouter = require('./routes/rent');

var app = express();
const cors = require('cors');

const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://adminUser:${encodeURIComponent(atlasCreds.password)}@atlascluster.zhkoeux.mongodb.net/?retryWrites=true&w=majority`);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/car/', indexRouter);
app.use('/auth/', authRouter);
app.use('/rent/', rentRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// GraphQL routes
app.use('/graphql', /*authModMiddleware, */graphqlHTTP({
  schema: graphqlSchema,
  graphiql: true, // Enable GraphiQL in development mode
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app };
