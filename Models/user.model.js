const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      username: {
        type: String,
        required: true
      },
      phoneNumber: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      },
      referalcode: {
        type: String,
        required: false
      },
      state: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      zipcode: {
        type: String,
        required: true
      }
    },
    {
      timestamps: true,
    }
  );
  
  const userModel = mongoose.model("User", userSchema);
  
  module.exports = userModel;