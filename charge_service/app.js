import express from 'express';
import path from 'path';
//for dirs
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
// Auth middleware
import atlasCreds from './atlasCreds.js';

// // everyday
// import './scheduler.js';

/* REMOVE */
const app = express();
import cors from 'cors';

import mongoose from 'mongoose';
import {Usercar} from "./schemas/usercar.js";
import {Car} from "./schemas/car.js";
import {User} from "./schemas/user.js";
import schedule from "node-schedule";

mongoose.connect(`mongodb+srv://adminUser:${encodeURIComponent(atlasCreds.password)}@atlascluster.zhkoeux.mongodb.net/?retryWrites=true&w=majority`);

/* REMOVE */
// necessary dirs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* REMOVE */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// SCHEDULER THAT CHARGES MONEY FOR RENTS EVERYDAY
async function executeCommand() {
  const usercars = await Usercar.find();

  for (const usercar of usercars) {

    const car = await Car.findOne({_id: usercar.carId});
    const user = await User.findOne({_id: usercar.userId});

    console.log(`Usercar ${usercar._id}: ${usercar}. User's balance: ${user.balance}`);

    if (user.balance < car.tariff) {
      await Usercar.deleteOne({_id: usercar._id});
      car.enabled = true;
      await car.save();
    } else {
      user.balance -= car.tariff;
      await user.save();
    }
  }
}

schedule.scheduleJob('* * * * *', () => {
  console.log('Running scheduled task...');
  executeCommand();
});

/* REMOVE */
export { app };
