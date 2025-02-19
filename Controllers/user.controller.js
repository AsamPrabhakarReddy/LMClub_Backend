const userModel = require("../Models/user.model");
const tokenModel = require("../Models/token.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Swal = require("sweetalert2");
const sendPdfAfterVerification = require("../utils/Terms_Conditions"); 

exports.registerUser = async(req,res)=>{
  console.log(req.body);
    try{
      const { 
        email, 
        password, 
        username, 
        phoneNumber,   
        street, 
        referalcode, 
        confirmpassword, 
        // state, 
        // city, 
        // zipcode 
      } = req.body;
      
      // Check if required fields are missing
      if (!email || !password || !username || !phoneNumber || !street || !confirmpassword) {
        return res.status(400).json({ error: "Required fields missing" });
      }
      
      // Check if password and confirm password match
      if (password !== confirmpassword) {
        return res.status(400).json({ error: "Password and confirm password do not match" });
      }

        const user = await userModel.findOne({email});
        if(user){
            return res.json({ message: "User Already Exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({
          email,
          password: hashedPassword,
          username,
          phoneNumber,
          street,
          referalcode,
          // state,
          // city,
          // zipcode
        });
        await newUser.save();
        
        const token = new tokenModel({
            userId: newUser._id,
            token: crypto.randomBytes(16).toString("hex"),
          });
        await token.save();
        const link = `http://localhost:5173/verify-email/${token.token}`;

       // Send verification email
    const sendEmail = async (email) => {
    // Configure the email transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false, 
      auth: {
          user: 'noreply@lmclub.club',
          pass: 'LMClub@lmclub25',
      },
    });
  
 

    // Email options
    const mailOptions = {
      from: 'noreply@lmclub.club',
      to: email,
      subject: 'Welcome to LMClub!!! 🎉 🎉. Thank you for registering with us',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                height: 100%;
                width: 100%;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                color: #333;
                font-size: 22px;
                font-weight: 600;
              }
              .content {
                margin-bottom: 30px;
              }
              .content p {
                margin: 0 0 10px;
                line-height: 1.5;
              }
              .content .button {
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
                margin-bottom: 20px;
              }
              .content .button a {
                border-radius: 40px;
                padding: 16px 100px;
                background-color: #007ae1;
                text-decoration: none;
                color: white;
                font-weight: 600;
              }
              .footer p {
                color: #999;
                font-size: 14px;
                margin: 8px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify your email address to complete registration</h1>
              </div>
              <div class="content">
                <p>Greetings, <span style="font-weight: bold">${email}!</span></p>
                <p>Thank you for your interest in joining LMCLUB! To complete your registration, we need you to verify your email address.</p>
                <div class="button">
                  <a href="${link}">Verify Email</a>
                </div>
              </div>
              <div class="footer">
                <p>Best regards,</p>
                <p>Team LMClub</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error in sending mail');
    }
  };

        sendEmail(email);
        return res.status(201).json({newUser});
    }
    catch (error) {     
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
}

exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Required fields missing" });
      }
      const user = await userModel.findOne({ email });
      if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.KEY, {
          expiresIn: "24h",
        });
        res.cookie("token", token, { httpOnly: true, maxAge: 1800000 });
        const data = [token, user._id];
        return res.status(200).json({ message: "Login Successful", data });
      } else {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };


  exports.confirmToken = async (req, res) => {
    try {
      const token = await tokenModel.findOne({ token: req.params.token });
      const user = await userModel.findOne({ _id: token.userId });
      await userModel.updateOne(
        {
          _id: token.userId,
        },
        {
          $set: { verified: true },
        }
      );
      await tokenModel.findByIdAndDelete(token._id);

      await user.save();
      res.status(200).json({ message: "Email Verified Successfully" });
      await sendPdfAfterVerification(user.email);
      // res.status(200).json({
      //   message: "Email Verified Successfully",
      //   action: "Please login now",
      //   loginUrl: "http://localhost:5173/login" 
      // });


    } catch (error) {
      res.status(401).json({ message: "Unauthorized", error: error.message });
    }
  };


  exports.getEmailVerification = async (req, res) => {
    const { email } = req.query; 
    
    try {
      const user = await userModel.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({
        verified: user.verified,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  