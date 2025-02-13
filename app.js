const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require('./Confiq/DB.js');
const userRoute = require('./Routes/user.route.js');
const otpRoute = require('./Routes/otp.route.js');
const contactRoute = require('./Routes/contact.Route.js');
const stripe = require("stripe")("sk_test_51QMcn82NPQsjFaoT1pDrHh84Fngrl6Qi05UQihwXNmPKtroZxxDGbFMucP6q2L6kIsM6eVYyVvHEphbsaAWU6G4d00uL0KBiT0");

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());


//testing 
app.get('/testing', (req,res)=>{
    res.send("serving is started !!");
})

// user Routes
app.use('/api', userRoute);
app.use('/api',otpRoute);
app.use('/api', contactRoute)


// stripe session

app.post('/create-stripe-session', async (req, res) => {
  try {
    const items = req.body;
    console.log('Received items:', JSON.stringify(items, null, 2)); 
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items data' });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} Membership` || 'Unknown Item',
          description: item.description || 'No description available',
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: parseInt(item.quantity, 10) || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:5173/payment-success',
      cancel_url: 'http://localhost:5173/payment-failed',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
  });
  

module.exports = app;




