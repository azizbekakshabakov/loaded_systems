const {User} = require('../schemas/user');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.createUser = async function(email, password) {
  // Check 
  const isBusy = await User.findOne({ email: email });

  if (isBusy) {
    return {code: 400, message: "Логин зайнит"};
  }

  // Hash 
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(password, salt);

  // Create 
  const user = await User.create({
    email: email,
    password: newPassword,
  });
  if (user) {
    return {code: 201, message: "Пользователь создан"};
  } else {
    return {code: 400, message: "Пользователь не создан"};
  }
}

exports.authenticateUser = async function(email, password) {
  // проверка пользователя
  const user = await User.findOne({ email: email });
  if (!user) {
    return {code: 400, message: "Пользователя нету в базе"};
  }

  // БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ
  if (user.lockUntil && user.lockUntil > Date.now()) {
    return {code: 401, message: "Пользователь временно заблочен"};
  }

  if (user && bcrypt.compareSync(password, user.password)) {
    // сбросить счетчик
    user.loginAttempts = 0;
    await user.save();

    return {code: 200, message: "Данные совпадают"};
  } else {
    // Счетчик запросов
    user.loginAttempts++;
    if (user.loginAttempts >= 3) {
      user.lockUntil = Date.now() + 60 * 1000; // Блокировка на 1 минуту
    }
    await user.save();

    return {code: 400, message: "Неверные данные. Bad request"};
  }
}

exports.createToken = async function(email) {
  const user = await User.findOne({ email: email });

  const token = jwt.sign({ id: user._id }, "qwerty", {
    expiresIn: "7d",
  });

  return token;
}