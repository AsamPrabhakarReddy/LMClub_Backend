const axios = require('axios');
const { application } = require('express');

async function generateAccessToken() {
    const response = await axios({
        url: process.env.PAYPAL_API + '/v1/oauth2/token',
        method: 'post',
        data:'grant_type=client_credentials',
        auth:{
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET,
        }
    })
    // console.log(response.data);
    return response.data.access_token;
}
// generateAccessToken();

exports.createOrder = async (line_items) => {

    const accessToken = await generateAccessToken();
    console.log(accessToken);
    const response = await axios({
        url: process.env.PAYPAL_API + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ accessToken,
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                items: line_items.map(item => ({
                  name: item.name,
                  description: item.description || "No description available",
                  quantity: item.quantity || 1,
                  unit_amount: {
                    currency_code: "USD",
                    value: item.price.toFixed(2),
                  },
                })),
                amount: {
                  currency_code: "USD",
                  value: line_items
                    .reduce((total, item) => total + item.price * item.quantity, 0)
                    .toFixed(2), 
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: line_items
                        .reduce((total, item) => total + item.price * item.quantity, 0)
                        .toFixed(2),
                    },
                  },
                },
            }, 
            ],

            // purchase_units: [
            //     {
            //         items: [
            //             {
            //                 name: 'Node.js Complete Course',
            //                 description: 'Node.js Complete Course with Express and MongoDB',
            //                 quantity: 1,
            //                 unit_amount: {
            //                     currency_code: 'USD',
            //                     value: '100.00'
            //                 }
            //             }
            //         ],

            //         amount: {
            //             currency_code: 'USD',
            //             value: '100.00',
            //             breakdown: {
            //                 item_total: {
            //                     currency_code: 'USD',
            //                     value: '100.00'
            //                 }
            //             }
            //         }
            //     }
            // ],

            application_context: {
                return_url: process.env.PAYPAL_BASE_URL + '/complete-order',
                // return_url: 'http://localhost:5173/payment-success',
                // return_url: 'https://lmclub.vercel.app/payment-success',
                cancel_url: process.env.PAYPAL_BASE_URL + '/cancel-order',
                // cancel_url: 'http://localhost:5173/payment-failed',
                // return_url: 'https://lmclub.vercel.app//payment-success',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'https://lmclub.vercel.app/'
            },

        })  
    })

    console.log(response.data);
    return response.data.links.find(link => link.rel === 'approve').href
}

// this.createOrder().then(result => console.log(result));

exports.capturePayment = async (orderId) => {
    
    const accessToken = await generateAccessToken()

    const response = await axios({
        url: process.env.PAYPAL_API  + `/v2/checkout/orders/${orderId}/capture`,
        // url: `${process.env.PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
            'Content-Length': 0,
        }
    })

    return response.data
}

