const jwt = require('jsonwebtoken');
const {User} = require('../schemas/user');

authModMiddleware = async (req, res, next) => {
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

authUserMiddleware = async (req, res, next) => {
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

module.exports = { authModMiddleware, authUserMiddleware };