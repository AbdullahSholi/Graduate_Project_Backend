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
        // type: [String],
        
        
        
    }]

});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;