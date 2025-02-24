const userModel = require("../Models/user.model");
const bussinessUserModel = require("../Models/bussiness.user.model");
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
        firstName,
        lastName, 
        phoneNumber,   
        street, 
        referalcode, 
        confirmpassword, 
        // state, 
        // city, 
        // zipcode 
      } = req.body;
      
      // Check if required fields are missing
      if (!email || !password || !firstName || !lastName || !phoneNumber || !street || !confirmpassword) {
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

        const bussinessUser = await bussinessUserModel.findOne({bussinessEmail: email});
        if(bussinessUser){
            return res.json({ message: "User Already Registered as Organization User!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({
          email,
          password: hashedPassword,
          firstName,
          lastName,
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
        // const link = `http://localhost:5173/verify-email/${token.token}`;
        link = `https://lmclub.vercel.app/verify-email/${token.token}`;
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
                <p>Welcome to LM Club Dear, <span style="font-weight: bold">${firstName}!</span></p>
                <p>We are thrilled to have you join our community where you can explore, engage, and enjoy a range of exclusive benefits tailored just for you.Whether you're looking to promote your business, discover deals, or connect with the community, LM Club is here to enhance your experience.Your journey with us is just beginning, and we look forward to seeing you grow and thrive within the LM Club.Stay tuned for updates and new features that will continually enhance your experience</p>
                <div class="button">
                  <a href="${link}">Verify Email</a>
                </div>
              </div>
              <div class="footer">
                <p>Warm regards,</p>
                <p>The LM Club Team</p>
                <p class="header">© 2024 LM Club. All rights reserved.</p>
              </div>
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

  // bussiness user registration
  
exports.bussinessUserRegisterUser = async(req,res)=>{
  console.log(req.body);
    try{
      const { 
        bussinessEmail, 
        password, 
        firstName, 
        lastName,
        phoneNumber,   
        street, 
        referalcode, 
        confirmpassword, 
        bussinessName,
        bussinessType
        // state, 
        // city, 
        // zipcode 
      } = req.body;
      
      // Check if required fields are missing
      if (!bussinessEmail || !password || !firstName || !lastName || !phoneNumber || !street || !confirmpassword || !bussinessName || !bussinessType) {
        return res.status(400).json({ error: "Required fields missing" });
      }
      
      // Check if password and confirm password match
      if (password !== confirmpassword) {
        return res.status(400).json({ error: "Password and confirm password do not match" });
      }

        const user = await bussinessUserModel.findOne({bussinessEmail});
        if(user){
            return res.json({ message: "User Already Exists" });
        }

        const consumerUser = await userModel.findOne({email: bussinessEmail});
        if(consumerUser){
            return res.json({ message: "User Already Registered as Consumer User!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new bussinessUserModel({
          bussinessEmail,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber,
          street,
          referalcode,
          bussinessName,
          bussinessType
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
        // const link = `http://localhost:5173/verify-bussiness-email/${token.token}`;
        link = `https://lmclub.vercel.app/verify-bussiness-email/${token.token}`;
       // Send verification email
    const sendEmail = async (bussinessEmail) => {
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
      to: bussinessEmail,
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
                <p>Welcome to LM Club Dear, <span style="font-weight: bold">${firstName}!</span></p>
                <p>We are thrilled to have you join our community where you can explore, engage, and enjoy a range of exclusive benefits tailored just for you.Whether you're looking to promote your business, discover deals, or connect with the community, LM Club is here to enhance your experience.Your journey with us is just beginning, and we look forward to seeing you grow and thrive within the LM Club.Stay tuned for updates and new features that will continually enhance your experience</p>
                <div class="button">
                  <a href="${link}">Verify Email</a>
                </div>
              </div>
              <div class="footer">
                <p>Warm regards,</p>
                <p>The LM Club Team</p>
                <p class="header">© 2024 LM Club. All rights reserved.</p>
              </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', bussinessEmail);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error in sending mail');
    }
  };

        sendEmail(bussinessEmail);
        return res.status(201).json({newUser});
    }
    catch (error) {     
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
}

exports.confirmTokenForBussinessRegistration = async (req, res) => {
  try {
    const token = await tokenModel.findOne({ token: req.params.token });
    const user = await bussinessUserModel.findOne({ _id: token.userId });
    await bussinessUserModel.updateOne(
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
    await sendPdfAfterVerification(user.bussinessEmail);
    // res.status(200).json({
    //   message: "Email Verified Successfully",
    //   action: "Please login now",
    //   loginUrl: "http://localhost:5173/login" 
    // });


  } catch (error) {
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};



  // bussiness user registration email verification
  
exports.getEmailVerificationForBussiness = async (req, res) => {
  const { bussinessEmail } = req.query; 
  
  try {
    const user = await bussinessUserModel.findOne({ bussinessEmail });
    
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

// bussiness login 

exports.bussinessLoginUser = async (req, res) => {
  try {
    const { bussinessEmail, password } = req.body;
    if (!bussinessEmail || !password) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    const user = await bussinessUserModel.findOne({ bussinessEmail });
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


// forgot password

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Email Not Found" });
    }
    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "1d",
    });

    // const link = `http://localhost:5173/resetPassword/${user._id}/${token}`;
    const link=`https://lmclub.vercel.app/resetPassword/${user._id}/${token}`;
    const transporter = nodemailer.createTransport({
      name: "hostgator",
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      auth: {
        user: "noreply@lmclub.club",
        pass: "LMClub@lmclub25",
      },
    });
    var mailOptions = {
      from: "noreply@lmclub.club",
      to: email,
      subject: "Reset Your Password | LMCLUB",
      html: `<!DOCTYPE html>
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
            text-align: center;
          }
    
          .content {
            margin-bottom: 30px;
          }
    
          .content p {
            margin: 0 0 10px;
            line-height: 1.5;
          }
    
          .content #para p {
            margin-top: 20px;
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
            padding-top: 16px;
            padding-bottom: 16px;
            padding-left: 100px;
            padding-right: 100px;
            background-color: #007ae1;
            text-decoration: none;
            color: white;
            font-weight: 600;
          }
    
          /* .footer {
            text-align: center;
          } */
    
          .footer p {
            color: #999;
            font-size: 14px;
            margin: 0;
            margin-top: 8px;
            margin-bottom: 8px;
          }
        </style>
      </head>
           <body>
          <div class="container">
            <div class="header">
              <h1>Reset your password</h1>
            </div>
            <div class="content">
              <p>This link will expire in 10 minutes.</p>
              <p>If it wasn't done by you, please contact us immediately.</p>
            </div>
            <div class="button">
              <a href="${link}"
                >Reset the password</a
              >
            </div>
            <div class="bottom">
              <p>Thanks for helping to keep LM Club secure!</p>
            </div>
            <div class="footer">
              <p class="footerOne">Best regards,</p>
              <p class="footerTwo">Team Syndèo</p>
            </div>
          </div>
        </body>
    </html>
      `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Email sending error:", error);
        return res.json({ status: false, message: "Error in sending mail" });
      } else {
        console.log("Email sent:", info.response);
        return res
          .status(200)
          .json({ status: true, message: "Check your mail once", email });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// reset password

exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  jwt.verify(token, process.env.KEY, (err, decoded) => {
    if (err) {
      return res.json({
        status: false,
        message: "Error in resetting the password",
      });
    } else {
      bcrypt.hash(password, 10).then((hash) => {
        userModel
          .findByIdAndUpdate({ _id: id }, { password: hash })
          .then((u) => {
            return res.status(200).json({ message: "Check your mail once" });
          })
          .catch((err) => {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
          });
      });
    }
  });
};

