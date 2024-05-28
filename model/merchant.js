const mongoose = require("mongoose")


// User schema and model
const merchantSchema = new mongoose.Schema({
    merchantname: {
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
    
    Avatar:{
        type: String,
        default: "http://res.cloudinary.com/dsuaio9tv/image/upload/v1708109280/blctf7fxgqai2t8p2lck.png",
    },
    storeName: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength:20,
        trim:true,
    },
    
    storeAvatar:{
        type: String,
        default: "https://res.cloudinary.com/dsuaio9tv/image/upload/v1716922097/ob8f4czlbbsy7dwu7t70.jpg",
    },
    storeCategory:{
        required: true,
        type: String,
    },
    storeSliderImages:{
        type: [String]
    },


    
    storeProductImages:{
        type: [String]
    }, 
    storeDescription:{
        type: String
    },
    storeSocialMediaAccounts:{
        type: [String],
        default:[
            "facebook",
            "telegram",
            "instagram",
            "whatsapp",
            "tiktok",
            "snapshat",
            "linkedin",
        ],
        
    },
    specificStoreCategories:{
        type:[String],
        default:["All Products"]
    },
    activateSlider:{
        type:Boolean,
        default:true,
    },
    activateCategory:{
        type:Boolean,
        default:true,
    },
    activateCarts:{
        type:Boolean,
        default:true,
    },
    publishableKey:{
        type: String,
    },
    secretKey:{
        type: String,
    },
    type: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Carts"
        }
    ],
    supportFAQ:{
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    userIdToNotify:{
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
    

});

const Merchants = mongoose.model('Merchants', merchantSchema);

module.exports = Merchants;