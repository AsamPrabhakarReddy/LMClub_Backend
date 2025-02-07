require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// temp otp storage 
const otpStorage = new Map();

// function to generate a numeric OTP of a given length
const generateOTP = (length = 6) => {
    let otp = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
};

// Send OTP to User
const sendOTP = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    const otp = generateOTP();
    otpStorage.set(phone, otp); 

    try {
        await client.messages.create({
            from: process.env.TWILIO_FROM_NUMBER,
            to: phone,
            body: `Your LMClub code is: ${otp}\nThank you for registering with us! Team LMClub`
        });

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};

// Verify User Entered OTP

const verifyOTP = (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const storedOTP = otpStorage.get(phone);
    if (storedOTP && storedOTP === otp) {
        // otpStorage.delete(phone); // Remove OTP after successful verification
        return res.json({ success: true, message: "OTP verified successfully!" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
};

module.exports = { sendOTP, verifyOTP };
