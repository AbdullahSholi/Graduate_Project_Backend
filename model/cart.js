const mongoose = require("mongoose")


// User schema and model
const cartSchema = new mongoose.Schema({
    
    cartName:{
        type:String,
        required:true,
        default:"test"
    }, 
    cartPrice:{
        type:Number,
        required:true,

    },
    cartDiscount:{
        type:Boolean,
        default:false,
    },
    cartLiked:{
        type:Boolean,
        default:true,
    },
    cartFavourite:{
        type:Boolean,
        default:true,
    },
    cartPrimaryImage:{
        type:String,
        default:"https://th.bing.com/th/id/OIP.gP1tVKJUehx7kX43qmrSswHaHa?w=176&h=180&c=7&r=0&o=5&pid=1.7"
    },
    cartRate:{
        type:Number,
        default:3,
    },
    cartPriceAfterDiscount:{
        type:Number,
        default:0
    },
    cartSecondaryImagesSlider:{
        type:[String],
        default:["https://th.bing.com/th/id/OIP.gP1tVKJUehx7kX43qmrSswHaHa?w=176&h=180&c=7&r=0&o=5&pid=1.7"]
    },
    cartDescription:{
        type:String,
    },
    cartCategory:{
        type: String,
        default: "All Products"
    },
    cartQuantities:{
        type: Number,
        required:true,
        default:10,
        min: 0

    },

    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchants"
    },
    isFavorite:{
        type: Boolean,
        default: false,
    },
    forMostViewed:{
        default: 0,
        type: Number
    },
    forTopRated:{
        default: 0,
        type: Number
    },
    forBestSeller:{
        default: 0,
        type:Number
    }, 
    productRates:{
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    discountValue:{
        type: Number,
        default:0
    }
    


});

const Carts = mongoose.model('Carts', cartSchema);

module.exports = Carts;