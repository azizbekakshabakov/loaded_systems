var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const {Car} = require('../schemas/car');
const { authModMiddleware, authUserMiddleware} = require('../middleware/auth');
const { redisClient } = require('../modules/redisClient');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/', authModMiddleware, upload.single('image'), async (req, res) => {
  try {
      const { name, description, tariff } = req.body;
      const image = req.file ? req.file.path : null;

      const newCar = new Car({
          name,
          description,
          image,
          tariff
      });

      await newCar.save();

      res.status(201).json({ message: 'Car entry created successfully', car: newCar });
  } catch (error) {
      res.status(404).json({ message: 'Error creating car entry', error });
  }
});

router.get("/", async (req, res) => {
    const start = process.hrtime();

    let key = `__express__${req.url}`;
    let response;

    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log('Взятие из кэша');
        response = res.status(200).send(JSON.parse(cachedData));
    } else {
        console.log("Нет кэша");
        const cars = await Car.find();
        await redisClient.set(key, JSON.stringify({ data: cars }), 'EX', 3600);
        response = res.status(200).send({ data: cars });
    }

    const elapsed = process.hrtime(start); // Get the elapsed time
    const elapsedTimeInMs = (elapsed[0] * 1e3 + elapsed[1] / 1e6).toFixed(2); // Convert to milliseconds
    console.log(`Azizbek: Request to ${req.method} ${req.url} took ${elapsedTimeInMs} ms`);

    return response;
});

router.get("/:id", async (req, res) => {
  const car = await Car.findOne({ _id: req.params.id });
  res.status(200).send({ data: car });
});

router.put("/:id", authModMiddleware, async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).send({ data: car, message: "Обновлен" });
});

router.delete("/:id", authModMiddleware, async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "Задача удалена" });
});

module.exports = router;