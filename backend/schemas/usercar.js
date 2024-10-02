const mongoose = require("mongoose");
const joi = require("joi");

const usercarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }
});

const validate = (usercar) => {
  const schema = joi.object({
    description: joi.string().required(),
  });
  return schema.validate(usercar);
};

const Usercar = mongoose.model("usercar", usercarSchema);

module.exports = { Usercar, validate };