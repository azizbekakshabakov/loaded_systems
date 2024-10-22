import jwt from 'jsonwebtoken';
import { User } from '../schemas/user.js';
import {redisClient} from "../modules/redisClient.js";

const authModMiddleware = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(400).json({ message: "нету токена" });
  try {
    const decoded = jwt.verify(token, "qwerty");

    req.userId = decoded.id;
    const user = await User.findOne({ _id: req.userId });

    if (user.role != "mod") return res.status(400).json({ message: "неверная роль" });

    next();
  } catch (err) {
    res.status(400).json({ message: "неверный токен" });
  }
};

const authUserMiddleware = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(400).json({ message: "нету токена" });
  try {
    const decoded = jwt.verify(token, "qwerty");
    // console.log(123123123);
    req.userId = decoded.id;
    const user = await User.findOne({ _id: req.userId });

    if (user.role != "user") return res.status(400).json({ message: "неверная роль" });

    next();
  } catch (err) {
    res.status(400).json({ message: "неверный токен" });
  }
};

const authModMiddlewareGraphQL = (next) => {
  return authMiddlewareGraphQLCommon(next, ['mod']);
};

const authUserMiddlewareGraphQL = (next) => {
  return authMiddlewareGraphQLCommon(next, ['user']);
};

const authAnyRoleMiddlewareGraphQL = (next) => {
  return authMiddlewareGraphQLCommon(next);
};

const authMiddlewareGraphQLCommon = (next, userRoles = []) => async (root, args, context, info) => {
  const token = context['req']['headers']['x-auth-token'];

  if (!token) {
    throw new Error('Token is missing');
  }

  // REDIS CACHING
  const key = `__express__/users/${token}`;
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    console.log('Fetched balance from cache');
    context.user = JSON.parse(cachedData);
    return next(root, args, context, info);
  }

  try {
    // VERIFY/DECODE JWT
    const decoded = jwt.verify(token, "qwerty");

    // FETCH USER
    const userId = decoded.id;
    const user = await User.findOne({ _id: userId });

    // IF THE USER DOESN'T HAVE CERTAIN ROLES THROW ERROR
    if (userRoles) {
      for (const userRole of userRoles) {
        if (user.role != userRole) throw new Error('Invalid role');
      }
    }

    // SAVE USER TO CONTEXT FOR FUTURE USE
    context.user = user;
    delete user['password'];

    // WRITE THE USER TO REDIS
    await redisClient.set(key, JSON.stringify(user), {
      EX: 10,
      NX: true
    });

    return next(root, args, context, info);
  } catch (err) {
    console.log(err);
    throw new Error('Invalid token', err);
  }
}

export { authModMiddleware, authUserMiddleware, authModMiddlewareGraphQL, authUserMiddlewareGraphQL, authAnyRoleMiddlewareGraphQL };