const mongoose = require("mongoose");

const bussinessUserSchema = new mongoose.Schema(
    {
        bussinessEmail: {
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
      bussinessName: {
        type: String,
        required: true
      },
      bussinessType: {
        type: String,
        required: true
      },
      // state: {
      //   type: String,
      //   required: true
      // },
      // city: {
      //   type: String,
      //   required: true
      // },
      // zipcode: {
      //   type: String,
      //   required: true
      // }
    },
    {
      timestamps: true,
    }
  );
  


  const bussinessUserSchemaModel = mongoose.model("BussinessUser", bussinessUserSchema);
  
  module.exports = bussinessUserSchemaModel;