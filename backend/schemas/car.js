const mongoose = require("mongoose");
const joi = require("joi");

const carSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  tariff: {type: Number, required: true},
  image: {type: String}
});

const validate = (car) => {
  const schema = joi.object({
    description: joi.string().required(),
  });
  return schema.validate(car);
};

const Car = mongoose.model("car", carSchema);

module.exports = { Car, validate };