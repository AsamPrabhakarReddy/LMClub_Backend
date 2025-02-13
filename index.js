const app = require('./app.js'); 

const PORT = process.env.PORT || 8080

app.listen(PORT, ()=>{
    console.log(`Server running in ${process.env.NODE_MODE} mode on Port ${process.env.PORT}`);
})
