import mongoose from 'mongoose';
import Joi from 'joi';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  balance: {type: Number, default: 0},
  role: {type: String}
});

// const validate = (task) => {
//   const schema = joi.object({
//     description: joi.string().required(),
//   });
//   return schema.validate(task);
// };

const User = mongoose.model("user", userSchema);

export { User };