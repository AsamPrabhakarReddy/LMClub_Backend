const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require('./Confiq/DB.js');
const userRoute = require('./Routes/user.route.js');
const otpRoute = require('./Routes/otp.route.js');

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: ['https://lmclub.vercel.app/']
}));
app.use(cookieParser());
app.use(bodyParser.json());


//testing 
app.get('/testing', (req,res)=>{
    res.send("serving is started !!");
})

// user Routes
app.use('/api', userRoute);
app.use('/api',otpRoute);

//global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
  });
  

module.exports = app;




