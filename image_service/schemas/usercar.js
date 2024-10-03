import mongoose from 'mongoose';
import Joi from 'joi';

const usercarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }
});

const validate = (usercar) => {
  const schema = Joi.object({
    description: Joi.string().required(),
  });
  return schema.validate(usercar);
};

const Usercar = mongoose.model("usercar", usercarSchema);

export { Usercar, validate };