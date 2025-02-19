const mongoose = require('mongoose');

const connectDB = async () => {
    try {
      await mongoose.connect("mongodb+srv://admin:cdnlmclub@cdn-lmclub.snbxd.mongodb.net/?retryWrites=true&w=majority&appName=CDN-LMClub",{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, 
        socketTimeoutMS: 30000,
      });
      console.log(`MongoDB connected ${mongoose.connection.host}`);
    } catch (error) {
      console.log(`Mongo DB server issue ${error}`);
    }
  };
  
  module.exports = connectDB;