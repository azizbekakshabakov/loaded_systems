import jwt from 'jsonwebtoken';
import { User } from '../schemas/user.js';

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

const authModMiddlewareGraphQL = (next) => async (root, args, context, info) => {
  const token = context['req']['headers']['x-auth-token'];

  if (!token) {
    throw new Error('Token is missing');
  }
  try {
    const decoded = jwt.verify(token, "qwerty");

    const userId = decoded.id;
    const user = await User.findOne({ _id: userId });

    if (user.role != "mod") throw new Error('Invalid role');

    return next(root, args, context, info);
  } catch (err) {
    console.log(err);
    throw new Error('Invalid token', err);
  }
};

export { authModMiddleware, authUserMiddleware, authModMiddlewareGraphQL };