var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const {Car} = require('../schemas/car');
const {Usercar} = require('../schemas/usercar');
const { authUserMiddleware } = require('../middleware/auth');
const { User } = require('../schemas/user');

router.post('/', authUserMiddleware, async (req, res) => {
  const { carId } = req.body;
  const car = await Car.findOne({ _id: carId });
  const user = await User.findOne({_id: req.userId});

  if (car.enabled == false) {
    return res.status(403).json({ message: 'Auto is taken' });
  }

  if (user.balance < car.tariff)
    return res.status(403).json({ message: 'Auto is too expensive' });
  // for one day
  user.balance -= car.tariff;
  await user.save();

  car.enabled = false;
  await car.save();
  
  const newusercar = new Usercar({
    userId: req.userId,
    carId: car._id
  });
  await newusercar.save();

  res.status(201).json({ message: 'The entry created successfully', newusercar });
});

router.get("/", authUserMiddleware, async (req, res) => {
  const usercar = await Usercar.find({userId: req.userId});
  // console.log(usercar); /////////

  let cars = usercar.map(entry => entry.carId);
  cars = await Car.find({ _id: { $in: cars } });

  res.status(200).send({ data: usercar, cars });
});

router.delete("/:id", authUserMiddleware, async (req, res) => {
  const car = await Car.findOne({_id: req.params.id});
  const userOfCar = await Usercar.findOne({carId: req.params.id});
  // console.log(userOfCar);
  if (req.userId == userOfCar.userId) {
    await Usercar.deleteOne({carId: req.params.id});

    car.enabled = true;
    car.save();

    return res.status(200).send({ message: "удалена" });
  }
  return res.status(403).send({message: 'wrong user'})
});

router.get("/balance", authUserMiddleware, async (req, res) => {
  const user = await User.findOne({_id: req.userId});
  // console.log('azizizizi', user); //////////////

  res.status(200).send({ data: user['balance'] });
});

router.post('/balance', authUserMiddleware, async (req, res) => {
  const { amount } = req.body;
  // console.log('asdfasdfadsf'+amount);  ///////////////////////
  const user = await User.findOne({_id: req.userId});

  user.balance += amount;
  await user.save();

  res.status(201).json({ message: 'The paid successfully' });
});

// router.get("/:id", async (req, res) => {
//   const car = await Car.findOne({ _id: req.params.id });
//   res.status(200).send({ data: car });
// });

// router.put("/:id", authModMiddleware, async (req, res) => {
//   const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });
//   res.status(200).send({ data: car, message: "Обновлен" });
// });



module.exports = router;