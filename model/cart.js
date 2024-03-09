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
        default:"test"
    },
    cartDiscount:{
        type:Boolean,
        default:false,
    },
    cartLiked:{
        type:Boolean,
        default:false,
    },
    cartFavourite:{
        type:Boolean,
        default:false,
    },
    cartPrimaryImage:{
        type:String,
        // default:""
    },
    cartRate:{
        type:Number,
        default:0,
    },
    cartPriceAfterDiscount:{
        type:Number,
        default:0
    },
    cartSecondaryImagesSlider:{
        type:[String],
    },
    cartDescription:{
        type:String,
    },
    cartCategory:{
        type: String,
        default: "All Products"
    },

    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchants"
    }

});

const Carts = mongoose.model('Carts', cartSchema);

module.exports = Carts;