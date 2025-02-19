const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendPdfAfterVerification = async (email) => {
  console.log("hello from sendPDFfterverification !");

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      auth: {
        user: "noreply@lmclub.club",
        pass: "LMClub@lmclub25",
      },
    });


    const pdfPath = path.join(__dirname, "../utils/Terms_Conditions.pdf");
    const pdfAttachment = fs.readFileSync(pdfPath);

    console.log(pdfPath);
    console.log(pdfAttachment);

    const mailOptions = {
      from: "noreply@lmclub.club",
      to: email,
      subject: "Your LMClub Terms & Conditions 📜",
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
              <h1>Please Find LMCLUB Terms and Conditions</h1>
            </div>
            <div class="content">
       
              <p>Thank you for your interest in joining LMCLUB! To complete your registration, we need you to verify your email address.</p>
              
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p>Team LMClub</p>
            </div>
          </div>
        </body>
      </html>
    `,
      attachments: [
        {
          filename: "Terms_Conditions.pdf",
          content: pdfAttachment,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Terms and Conditions PDF sent to ${email}`);
  } catch (error) {
    console.error(" Error sending PDF:", error);
  }
};

module.exports = sendPdfAfterVerification;
