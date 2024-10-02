const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
var express = require('express');
var router = express.Router();
const {User} = require('../schemas/user');

router.post("/register", async (req, res) => {

  // Check if user exists
  const isBusy = await User.findOne({ email: req.body.email });
  if (isBusy) {
    res.status(400).send("Логин зайнит");
    return;
    // throw new Error("");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(req.body.password, salt);

  // Create user
  const user = await User.create({
    email: req.body.email,
    password: newPassword,
    role: req.body.role
  });
  if (user) {
    res.status(201).json({
      message: "Пользователь создан",
      status: "Успешно",
    });
  } else {
    res.status(400).send("Пользователь не создан");
  }
});

router.post("/login", async (req, res) => {
  // Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Пользователя нету в базе");
    return;
  }
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.status(200).json({
      message: "Пользователь залогинился",
      status: "Успшно",
      token: generateToken(user._id),
      role: user.role
    });
  } else {
    res.status(400).send("Неверные данные. Bad request");
  }
});

//Generate JWT for the user
const generateToken = (id) => {
  return jwt.sign({ id }, "qwerty", {
    expiresIn: "7d",
  });
};

module.exports = router;