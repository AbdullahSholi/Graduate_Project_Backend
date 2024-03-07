const mongoose = require("mongoose")


// User schema and model
const storeSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength:20,
        lowercase: true,
        trim:true,
    },
    
    storeAvatar:{
        type: String,
        default: "http://res.cloudinary.com/dsuaio9tv/image/upload/v1708109280/blctf7fxgqai2t8p2lck.png",
    },
    storeCategory:{
        type: String,
    },
    storeSliderImages:{
        type: [String]
    },
    storeProductImages:{
        type: [String]
    }

});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;