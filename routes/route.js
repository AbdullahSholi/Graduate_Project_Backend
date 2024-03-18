// import Packages
const express = require("express")
const session = require("express-session")
const app = express()
const controller = require("../controllers/controller")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

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

 

// routes
router.get("/matjarcom/api/v1/users",authenticateToken ,controller.getAllUsers)
router.get("/matjarcom/api/v1/users/:userName",controller.getSingleUser)
router.post("/matjarcom/api/v1/users",controller.addNewUser)
router.put("/matjarcom/api/v1/users",controller.updateUser)
router.delete("/matjarcom/api/v1/users/:userId",controller.deleteUser)

// for Users( Customers ) Login & Register & update Profile & file upload endpoint
router.post("/matjarcom/api/v1/login",controller.login)
router.post("/matjarcom/api/v1/register",controller.register)
router.patch("/matjarcom/api/v1/update-user-profile/:email",authenticateToken,controller.updateUserProfile)
router.post("/matjarcom/api/v1/avatar", upload.single("avatar"), controller.uploadfile)
router.get("/matjarcom/api/v1/profile/:email",authenticateToken,controller.getUserProfile)

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

module.exports = router
