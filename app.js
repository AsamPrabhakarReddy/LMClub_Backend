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
// const PAYPAL_CLIENT_ID = "AXv6b05ECt52vidXoA8u8SLbfnHMlsZZTECoHQnPnxmb1kpHDW0GMfDIV41H-rVRgEk54irwQlbUl4so";
// const PAYPAL_SECRET = "ENAnGTfQjbHwrv_QPybyvv5XtJtwy5KnVEvNKzxRgwpa9BD_pjg3ycbM2jqtcJW9cDKMGjoo2sJK5sPG";
// const PAYPAL_API = "https://api-m.sandbox.paypal.com";
const paypal = require('./PaypalServices/paypal.js');



dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
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
      // success_url: 'http://localhost:5173/payment-success',
      success_url: 'https://lmclub.vercel.app/payment-success',
      // cancel_url: 'http://localhost:5173/payment-failed',
      cancel_url: 'https://lmclub.vercel.app/payment-failed',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/pay', async (req, res) => {
  try {
    const { line_items } = req.body; 

    if (!line_items || !Array.isArray(line_items)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    console.log("Received line items:", line_items);

    const url = await paypal.createOrder(line_items); 

    res.json({ approval_url: url });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: error.message });
  }
});

// Complete Order Route
app.get("/complete-order", async (req, res) => {
  try {
    console.log("Received request with query params:", req.query);

    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Error: Missing token");
    }

    const result = await paypal.capturePayment(token);

    // res.send("Membership purchased successfully: " + JSON.stringify(result));


    res.json({ message: "Membership purchased successfully", data: result });
  } catch (error) {
    console.error("Error in /complete-order:", error.message);
    res.status(500).send("Error: " + error.message);
  }
  // res.send('complete order!');
});


app.get('/cancel-order', (req, res) => {
  res.redirect('/')
})



//global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
  });
  

module.exports = app;




