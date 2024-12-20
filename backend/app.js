import createError from 'http-errors';
import express from 'express';
import path from 'path';
//for dirs
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
// GraphQL
// import graphqlSchema from './graphql/schema.js';
// import { createHandler } from 'graphql-http/lib/use/express';
// import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';////////////////////////////////////////////////////////////////
import {ApolloServer} from "@apollo/server";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import {expressMiddleware} from "@apollo/server/express4";
import {typeDefs, resolvers} from './graphql/apollo-schema.js'
// Auth middleware
import { authModMiddleware } from './middleware/auth.js';
import atlasCreds from './atlasCreds.js';

/* REMOVE */
// import './scheduler.js';

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

// GRAPHQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: false
});

await server.start();

// Express middlewares
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));
// app.use(authModMiddleware); // Apply your authentication middleware
app.use('/graphql', expressMiddleware(server, {
  context: async ({ req }) => ({ req }), // Provide context if needed
}));

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
