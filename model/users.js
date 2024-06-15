const mongoose = require("mongoose")


// User schema and model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength:20,
        lowercase: true,
        trim:true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true,
        length:10,
    },
    country:{
        type: String,
        required: true,
        lowercase: true,
    },
    street: {
        type: String,
        default: "none",
    },
    Avatar:{
        type: String,
        default: "http://res.cloudinary.com/dsuaio9tv/image/upload/v1708109280/blctf7fxgqai2t8p2lck.png",
    },
    favouriteList: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    cartList:{
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    userChat:{
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },


});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;