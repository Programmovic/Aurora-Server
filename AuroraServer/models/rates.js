const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Rate = mongoose.model("Rate", rateSchema);

module.exports = Rate;