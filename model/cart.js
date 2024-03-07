const mongoose = require("mongoose")


// User schema and model
const cartSchema = new mongoose.Schema({
    cartPrimaryImage:{
        type:String,
    },
    cartName:{
        type:String,
        required:true,
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
        default:false,
    },
    cartPriceAfterDiscount:{
        type:Number,
    },
    cartSecondaryImagesSlider:{
        type:[String],
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchants"
    }

});

const Carts = mongoose.model('Carts', cartSchema);

module.exports = Carts;