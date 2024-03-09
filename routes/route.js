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
router.patch("/matjarcom/api/v1/merchant-update/:email",controller.merchantUpdate)
router.get("/matjarcom/api/v1/merchant-profile/:email",controller.merchantProfile);
router.post("/matjarcom/api/v1/store-avatar", upload.single("avatar"), controller.uploadStoreAvatar)
router.patch("/matjarcom/api/v1/update-store-informations/:email",controller.updateStoreInformation)
router.patch("/matjarcom/api/v1/connect-social-media-accounts/:email",controller.connectSocialMediaAccounts)
router.post("/matjarcom/api/v1/store-slider-images", upload.single("avatar"), controller.storeSliderImages)
router.post("/matjarcom/api/v1/specific-store-categories/:email", controller.specificStoreCategories)
router.delete("/matjarcom/api/v1/delete-specific-store-categories/:email", controller.deleteSpecificStoreCategories)
router.patch("/matjarcom/api/v1/update-specific-store-categories/:email", controller.updateSpecificStoreCategories)
router.delete("/matjarcom/api/v1/delete-specific-image-from-store-slider/:email", controller.deleteSpecificImageFromStoreSlider)

// Activator

router.patch("/matjarcom/api/v1/activate-store-slider/:email", controller.activateStoreSlider)
router.patch("/matjarcom/api/v1/activate-store-category/:email", controller.activateStoreCategory)
router.patch("/matjarcom/api/v1/activate-store-carts/:email", controller.activateStoreCarts)




// For store carts
router.post("/matjarcom/api/v1/test-specific-cart/:email", controller.testSpecificCart)
router.get("/matjarcom/api/v1/test-get-merchant-cart/:email", controller.testGetMerchantCart)
router.get("/matjarcom/api/v1/test-get-merchant-cart-content/:email", controller.testGetMerchantCartContent) // for display all carts
router.post("/matjarcom/api/v1/cart-upload-primary-image", upload.single("avatar"), controller.cartUploadPrimaryImage)


module.exports = router
