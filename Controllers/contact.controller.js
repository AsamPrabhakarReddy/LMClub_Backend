
const contactModel = require('../Models/contact.model.js'); 
const nodemailer = require("nodemailer");

exports.contactDetails = async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;

        // Check if the email already exists
        const existingDetails = await contactModel.findOne({ email });

        if (existingDetails) {
            return res.status(401).json({ message: 'User already exists' });
        }

        // Create new contact entry
        const newContactUser = new contactModel({
            fullName,
            email,
            subject,
            message 
        });

        await newContactUser.save();

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
              subject: 'Welcome to LMClub!!! 🎉 🎉. Thank you for Contacting with us',
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
                        <h1> Welcome to LMClub!! </h1>
                      </div>
                      <div class="header ">
                        <p>Greetings, <span style="font-weight: bold">Hello ${fullName}</span></p>
                        <p>Our team members will connect you, very soon!</p>
                        
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
                

        res.status(201).json({ message: 'Added successfully!', newContactUser });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Internal server error' });
    }
};

