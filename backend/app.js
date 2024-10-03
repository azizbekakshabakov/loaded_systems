import createError from 'http-errors';
import express from 'express';
import path from 'path';
//for dirs
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
// GraphQL
import graphqlSchema from './graphql/schema.js';
import { createHandler } from 'graphql-http/lib/use/express';
import { authModMiddleware } from './middleware/auth.js';
import atlasCreds from './atlasCreds.js';

// everyday
import './scheduler.js';

import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import rentRouter from './routes/rent.js';

const app = express();
import cors from 'cors';

import mongoose from 'mongoose';

mongoose.connect(`mongodb+srv://adminUser:${encodeURIComponent(atlasCreds.password)}@atlascluster.zhkoeux.mongodb.net/?retryWrites=true&w=majority`);

// necessary dirs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/graphql', /*authModMiddleware, */createHandler({
  schema: graphqlSchema,
  context: (req, res) => ({ req, res })
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

export { app };
