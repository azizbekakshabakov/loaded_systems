import createError from 'http-errors';
import express from 'express';
import path from 'path';
//for dirs
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import atlasCreds from './atlasCreds.js';

import indexRouter from './routes/index.js';

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

app.use('/', indexRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
