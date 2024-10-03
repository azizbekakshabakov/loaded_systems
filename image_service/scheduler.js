import schedule from 'node-schedule';
import { Usercar } from './schemas/usercar.js';
import { Car } from './schemas/car.js';
import { User } from './schemas/user.js';

async function executeCommand() {
  const usercars = await Usercar.find();
  
  usercars.forEach(async (usercar, index) => {
    console.log(`Usercar ${index + 1}:`, usercar);
    
    const car = await Car.findOne({_id: usercar.carId});
    const user = await User.findOne({_id: usercar.userId});
    
    if (user.balance < car.tariff) {
      await Usercar.deleteOne({_id: usercar._id});
      car.enabled = true;
      car.save();
    } else {
      user.balance -= car.tariff;
      user.save();
    }
  });
}

schedule.scheduleJob('0 0 * * *', () => {
//   console.log('Running scheduled task...');
  executeCommand();
});