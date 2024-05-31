const mongoose = require("mongoose")


// User schema and model
const storeSchema = new mongoose.Schema({
    stores: [{
        merchantname: String,
        email: String,
        phone: String,
        country: String,
        Avatar: String,
        storeName: String,
        storeAvatar: String,
        storeCategory: String,
        storeSliderImages: [String],
        storeProductImages: [String],
        storeDescription: String,
        storeSocialMediaAccounts: [String],
        activateSlider: Boolean,
        activateCategory: Boolean,
        specificStoreCategories:[String],
        activateCarts: Boolean,
        backgroundColor: String,
        boxesColor: String,
        primaryTextColor: String,
        secondaryTextColor: String,
        clippingColor: String,
        smoothy: String,
        design: String
        // type: [String],
        
        
        
    }]

});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;