const mongoose = require('mongoose'); 

const contactSchema = mongoose.Schema({
    fullName:{
        type:String, 
        required:true
    },
    email:{
        type:String, 
        required:true,
        unique:true
    },
    subject:{
        type:String, 
        required:true
    },
    message:{
        type:String, 
    },
})

module.exports = mongoose.model('Contact', contactSchema);