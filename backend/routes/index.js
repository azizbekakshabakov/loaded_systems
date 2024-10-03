import { Router } from 'express';
import multer from 'multer';
import FormData from 'form-data';
import { Car } from '../schemas/car.js';
import { authModMiddleware, authUserMiddleware } from '../middleware/auth.js';
import { redisClient } from '../modules/redisClient.js';
import axios from 'axios';
import fs from "fs";

// СОЗДАТЬ ЭКЗЕМПЛЯР Router
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', authModMiddleware, upload.single('image'), async (req, res) => {
  try {
      const { name, description, tariff } = req.body;

      const formData = new FormData();
      formData.append('image', req.file.buffer, req.file.originalname);

      // Forward the image to localhost:3001
      const result = await axios.post('http://localhost:3001/add-image', formData, {
          headers: {
              ...formData.getHeaders(),
          },
      });
      const image = result['data']['image'];

      const newCar = new Car({
          name,
          description,
          image,
          tariff
      });

      await newCar.save();

      res.status(201).json({ message: 'Car entry created successfully', car: newCar });
  } catch (error) {
      // console.log(error.message);
      res.status(404).json({ message: 'Error creating car entry', error: error.message });
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

export default router;