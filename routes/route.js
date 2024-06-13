// import Packages
const express = require("express")
const session = require("express-session")
const app = express()
const controller = require("../controllers/controller")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const rateLimit = require('express-rate-limit');


const { error } = require("console")
const upload = require("../controllers/controller").upload
console.log(upload)
const cors = require("cors")
app.use(cors())


// Register
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {

    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Access Denied' });

    const [bearer, token] = authHeader.split(' ');
    

    if (bearer !== 'Bearer' || !token) {
        return res.status(403).json({ message: 'Invalid Token Format' });
    }

    

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Token' });
        }
        req.user = user;
        next();
    });
};



// create router
const router = express.Router()


// First Screen loader
router.get("/matjarcom/api/v1/",(req,res)=>{
    res.render('index');
})

/////////////////////
// Apply rate limiting middleware
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 60 seconds
    max: 3, // Max 3 failed attempts
    message: 'Too many login attempts, please try again after 60 seconds',
  });
 


// routes
router.get("/matjarcom/api/v1/users",authenticateToken ,controller.getAllUsers)
router.get("/matjarcom/api/v1/users/:userName",controller.getSingleUser)
router.post("/matjarcom/api/v1/users",controller.addNewUser)
router.put("/matjarcom/api/v1/users",controller.updateUser)
router.delete("/matjarcom/api/v1/users/:userId",controller.deleteUser)

router.use('/matjarcom/api/v1/login', loginLimiter);

// for Users( Customers ) Login & Register & update Profile & file upload endpoint
router.post("/matjarcom/api/v1/login",controller.login)
router.post("/matjarcom/api/v1/register",controller.register)
router.patch("/matjarcom/api/v1/update-user-profile/:email",authenticateToken,controller.updateUserProfile)
router.post("/matjarcom/api/v1/avatar", upload.single("avatar"), controller.uploadfile)
router.get("/matjarcom/api/v1/profile/:email",authenticateToken,controller.getUserProfile)
router.post("/matjarcom/api/v1/customer-add-to-favorite-list/:email",authenticateToken,controller.customerAddToFavoriteList)
router.get("/matjarcom/api/v1/get-customer-favorite-list/:email",authenticateToken,controller.getCustomerFavoriteList)
router.delete("/matjarcom/api/v1/delete-product-from-favorite-list/:email",controller.deleteProductFromFavoriteList)
router.delete("/matjarcom/api/v1/delete-product-from-favorite-list-from-different-stores/:email",controller.deleteProductFromFavoriteListFromDifferentStores)
router.get("/matjarcom/api/v1/customer-get-favorite-products-depend-on-category",controller.customerGetFavoriteProductsDependOnCategory)



router.post("/matjarcom/api/v1/customer-add-to-cart-list/:email",authenticateToken,controller.customerAddToCartList)
router.get("/matjarcom/api/v1/get-customer-cart-list/:email",authenticateToken,controller.getCustomerCartList)
router.delete("/matjarcom/api/v1/delete-product-from-cart-list-from-different-stores/:email",controller.deleteProductFromCartListFromDifferentStores)
router.delete("/matjarcom/api/v1/delete-all-products-from-cart-list/:email",controller.deleteAllProductsFromCartList)
router.get("/matjarcom/api/v1/customer-pay-for-products/:email", controller.customerPayForProducts)
router.post("/matjarcom/api/v1/increment-most-viewed/:email",  controller.incrementMostViewed);
router.post("/matjarcom/api/v1/get-statistics-about-products/:email",  controller.getStatisticsAboutProducts);
router.post("/matjarcom/api/v1/increment-most-viewed-for-category/:email",  controller.incrementMostViewedForCategory);
router.post("/matjarcom/api/v1/get-statistics-about-products-for-category/:email",  controller.getStatisticsAboutProductsForCategory);

router.use('/matjarcom/api/v1/merchant-login', loginLimiter);

// for Merchants login & register & update 
router.post("/matjarcom/api/v1/merchant-login",controller.merchantLogin)
router.post("/matjarcom/api/v1/merchant-register",controller.merchantRegister)
router.patch("/matjarcom/api/v1/merchant-update/:email",authenticateToken,controller.merchantUpdate)
router.get("/matjarcom/api/v1/merchant-profile/:email",authenticateToken,controller.merchantProfile);
router.post("/matjarcom/api/v1/store-avatar", upload.single("avatar"),authenticateToken, controller.uploadStoreAvatar)
router.patch("/matjarcom/api/v1/update-store-informations/:email",authenticateToken,controller.updateStoreInformation)
router.patch("/matjarcom/api/v1/connect-social-media-accounts/:email",authenticateToken,controller.connectSocialMediaAccounts)
router.post("/matjarcom/api/v1/store-slider-images", upload.single("avatar"),authenticateToken, controller.storeSliderImages)
router.post("/matjarcom/api/v1/specific-store-categories/:email",authenticateToken, controller.specificStoreCategories)
router.delete("/matjarcom/api/v1/delete-specific-store-categories/:email",authenticateToken, controller.deleteSpecificStoreCategories)
router.patch("/matjarcom/api/v1/update-specific-store-categories/:email",authenticateToken, controller.updateSpecificStoreCategories)
router.delete("/matjarcom/api/v1/delete-specific-image-from-store-slider/:email",authenticateToken, controller.deleteSpecificImageFromStoreSlider)
router.delete("/matjarcom/api/v1/delete-category-connected-to-cart/:email",authenticateToken, controller.deleteCategoryConnectedToCarts)
router.post("/matjarcom/api/v1/merchant-add-store-to-database/:email", controller.merchantAddStoreToDatabase)

// Merchant add payment Information
router.post("/matjarcom/api/v1/add-payment-informations/:email", controller.addPaymentMethod)
// Merchant get payment Information 
router.get("/matjarcom/api/v1/get-payment-informations/:email", controller.getPaymentMethod)


// Activator

router.patch("/matjarcom/api/v1/activate-store-slider/:email",authenticateToken, controller.activateStoreSlider)
router.patch("/matjarcom/api/v1/activate-store-category/:email",authenticateToken, controller.activateStoreCategory)
router.patch("/matjarcom/api/v1/activate-store-carts/:email",authenticateToken, controller.activateStoreCarts)




// For store carts
router.post("/matjarcom/api/v1/test-specific-cart/:email",authenticateToken, controller.testSpecificCart)
router.get("/matjarcom/api/v1/test-get-merchant-cart/:email",authenticateToken, controller.testGetMerchantCart)
router.get("/matjarcom/api/v1/test-get-merchant-cart-content/:email",authenticateToken, controller.testGetMerchantCartContent) // for display all carts
router.post("/matjarcom/api/v1/cart-upload-primary-image", upload.single("avatar"),authenticateToken, controller.cartUploadPrimaryImage)
router.post("/matjarcom/api/v1/cart-upload-secondary-images", upload.single("avatar"),authenticateToken, controller.cartUploadSecondaryImages)
router.delete("/matjarcom/api/v1/delete-specific-image-from-cart-image-slider/:email",authenticateToken, controller.deleteSpecificImageFromCartImageSlider)
router.patch("/matjarcom/api/v1/test-update-specific-cart/:email",authenticateToken, controller.testUpdateSpecificCart)
router.delete("/matjarcom/api/v1/delete-cart/:email", controller.deleteCart)


// Guest ( Display List of Stores  )
router.get("/matjarcom/api/v1/get-all-stores/",controller.getAllStores)
// Guest ( Display List of Stores for a Specific Category )
router.get("/matjarcom/api/v1/get-all-stores-for-one-category/:storeCategory",controller.getAllStoresForOneCategory)
router.get("/matjarcom/api/v1/store-data/:email",controller.storeData);
router.get("/matjarcom/api/v1/test-get-store-cart/:email", controller.testGetStoreCart)
router.get(`/matjarcom/api/v1/get-all-carts-for-one-category`,controller.getAllCartsForOneCategory)

// Delete merchant with all store data
router.delete("/matjarcom/api/v1/delete-store/:email",authenticateToken, controller.deleteStore)


// store index ( To Solve favorite button in flutter frontend ) 
router.post("/matjarcom/api/v1/add-store-index/:email", controller.addStoreIndex)
router.get("/matjarcom/api/v1/get-store-index/", controller.getStoreIndex)


// FAQ 
router.post("/matjarcom/api/v1/add-your-question/:email", controller.addYourQuestion);
router.get("/matjarcom/api/v1/get-list-of-questions/:email", controller.getListOfQuestion);
router.post("/matjarcom/api/v1/add-your-answer/:email", controller.addYourAnswer);
router.get("/matjarcom/api/v1/get-list-of-answered-questions/:email", controller.getListOfAnsweredQuestions);


// Rate Product
router.post("/matjarcom/api/v1/add-your-rate/:email", controller.addYourRate);
router.post("/matjarcom/api/v1/get-average-product-rate/:email", controller.getAverageProductRate);
router.post("/matjarcom/api/v1/get-product-rate-list/:email", controller.getProductRateList);
router.post("/matjarcom/api/v1/get-number-of-rates-via-number-of-stars/:email", controller.getNumberOfRatesViaNumberOfStars);


// Send Notifications
router.get("/matjarcom/api/v1/send-notification", controller.sendNotification);
router.post("/matjarcom/api/v1/send-notification-to-device", controller.sendNotificationToDevice);
router.post("/matjarcom/api/v1/send-custom-notification-to-device", controller.sendCustomNotificationToDevice);
router.post("/matjarcom/api/v1/add-user-device-id-into-list/:email", controller.addUserDeviceIdIntoList);
router.delete("/matjarcom/api/v1/delete-user-device-id-from-list/:email", controller.deleteUserDeviceIdFromList);
router.get("/matjarcom/api/v1/get-device-id-list/:email", controller.getDeviceIdList);
router.post("/matjarcom/api/v1/find-user-device-id-from-list/:email", controller.findUserDeviceIdFromList);

// Customer Forgot & Reset password 
router.post('/matjarcom/api/v1/customer-forgot-password', controller.customerForgotPassword );
router.post('/matjarcom/api/v1/customer-reset-password/:token', controller.customerResetPassword );

// Merchant Forgot & Reset password 
router.post('/matjarcom/api/v1/merchant-forgot-password', controller.merchantForgotPassword );
router.post('/matjarcom/api/v1/merchant-reset-password/:token', controller.merchantResetPassword );


// For Chat System
router.get("/matjarcom/api/v1/get-all-customers",controller.getAllCustomers)


// Other
router.post("/matjarcom/api/v1/get-product-name-via-index/:email", controller.getProductNameViaIndex);
router.get("/matjarcom/api/v1/merchant-profile-second/:email",controller.merchantProfileSecond);
////////////////////////////////////////////////////////////////////

// Admin Dashboard
router.post("/matjarcom/api/v1/admin-login",loginLimiter, controller.adminLogin)
router.post("/matjarcom/api/v1/admin-register",controller.adminRegister)
router.post('/matjarcom/api/v1/admin-forgot-password', controller.adminForgotPassword );
router.post('/matjarcom/api/v1/admin-reset-password/:token', controller.adminResetPassword );


router.get('/matjarcom/api/v1/display-all-merchants/:email', controller.displayAllMerchants );
router.get('/matjarcom/api/v1/display-all-stores/:email', controller.displayAllStores );
router.get('/matjarcom/api/v1/display-your-wealth/:email', controller.displayYourWealth );
router.delete('/matjarcom/api/v1/delete-merchant-store/:email', controller.deleteMerchantStore );
router.delete('/matjarcom/api/v1/delete-merchant/:email', controller.deleteMerchant );
router.get('/matjarcom/api/v1/display-stores-categories/:email', controller.displayStoresCategories );
router.post('/matjarcom/api/v1/add-new-category/:email', controller.addNewCategory );
router.delete('/matjarcom/api/v1/delete-category/:email', controller.deleteCategory );
router.get('/matjarcom/api/v1/display-stores-for-each-category/:email', controller.displayStoresForEachCategory );
router.post('/matjarcom/api/v1/add-percentage-for-each-transaction/:email', controller.addPercentageForEachTransaction );
router.get('/matjarcom/api/v1/display-most-popular-stores/:email', controller.displayMostPopularStores );





module.exports = router
