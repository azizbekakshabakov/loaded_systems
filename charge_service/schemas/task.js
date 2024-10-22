const mongoose = require("mongoose");
const joi = require("joi");

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const validate = (task) => {
  const schema = joi.object({
    description: joi.string().required(),
  });
  return schema.validate(task);
};

const Task = mongoose.model("task", taskSchema);

module.exports = { Task, validate };