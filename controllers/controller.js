// import Packages
const express = require("express")
const session = require("express-session")
const app = express()

const users=require("../model/users")
const mongoose = require("mongoose")
const Users = require("../model/users")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
app.use(express.json())
const path = require("path");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary")
const { error } = require("console");
const cors = require("cors")
const Merchants = require("../model/merchant")
const Carts = require("../model/cart")
app.use(cors())





/////////////////////////////////////

const getAllUsers = async (req,res)=>{
    const query = req.query;
    const limit = query.limit || 4;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    res.send(await Users.find().limit(limit).skip(skip))
}

const getSingleUser = async (req,res)=>{
    var userName = req.params.userName
    console.log(userName)
    const user = await Users.find({name:userName})
    res.send(user)
}

const addNewUser = async (req,res)=>{
    console.log(req.body)
    const user = new Users(req.body)
    user.save()
    res.send({Message: "Add New User Successfuly!!", Result:await Users.find()})
}

const updateUser = async (req,res)=>{
    const {id, name} = req.body;
    console.log(id,name)
    const updatedUser = await users.findByIdAndUpdate(id,{name:name},{new:true})
    res.send(updatedUser)
}

const deleteUser = async (req,res)=>{
    const userId = req.params.userId;
    console.log(userId)
    const deletedUser = await users.findByIdAndDelete(userId)
    res.send({Result: await Users.find({})})
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        

        // Generate JWT token
        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: "1y" });

        // Send the token in the response
        res.json({ email:email,token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const register = async (req, res) => {
    try {
        const { username,email, password, phone, country, street} = req.body;
        console.log(req.body)

        // Check if the user already exists
        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const user = new Users({
            username: username,
            email: email,
            password: hashedPassword,
            phone:phone,
            country:country,
            street: street,
        });
        // Save the user to the database
        await user.save();

        // Generate JWT token
        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: "1y" });
        console.log(token)
        // Send the token in the response
        res.status(201).send( {email:email,Token: token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const updateUserProfile = async (req, res)=>{
    try{
        const {username,email, password,phone , country, street} = req.body;
        console.log(username,email,password)
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        ////////////
        const filter = { email: req.params.email };
        const update = { username: username, email: email, password: hashedPassword, phone: phone, country: country, street: street };
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document

        const updatedUserProfile = await Users.findOneAndUpdate(filter, update, options);
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        res.status(500).send({Error:error})
    }
}

const uploadfile = async (req, res) => {
    var email = req.body.email;
    const user = await Users.findOne({email:email});
    
     cloudinary.uploader.upload(req.file.path, function(err, result) {
        // console.log(err)
        if(err){
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Error"
            })
        }
        var imageUrl = result.url;
        console.log(email);
        user.Avatar = result.url;
        user.save()
        console.log(user);
        // const temp = Users.findOne({email:email});
        // console.log(temp);
        
        
        res.status(200).send({
            success: true,
            message: "Uploaded",
            data: result.url,
            email:email,
        })
    })
    // console.log(req.file.path)
    // res.send({ status: "Success" });
  }

const storage = multer.diskStorage({
    filename: function( req, file, cb){
        cb(null,file.originalname)
    }
})

// to make it access only images , we will use fileFilter

const fileFilter = (req,file,cb)=>{
    const imageType = file.mimetype.split("/")[0]
    if(imageType=="image"){
      cb(null,true)
      // null --> error 
      // true --> access it to upload
    }else{
      return cb(error,false)
    }
}

const upload = multer({ storage: storage });

const getUserProfile = async (req,res)=>{
    var email = req.params.email
    console.log(email)
    const user = await Users.findOne({email: email})
    res.send(user)
}

const merchantLogin = async (req,res)=>{
    try {
        const { email, password } = req.body;

        // Find the user by email
        const merchant = await Merchants.findOne({ email });
        if (!merchant) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, merchant.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        

        // Generate JWT token
        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: "1y" });

        // Send the token in the response
        res.json({ email:email,token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const merchantRegister = async (req, res) => {
    try {//                                                                                                                                                                                     
        const { merchantname,email, password, phone, country, Avatar, storeName, storeAvatar, storeCategory, storeSliderImages, storeProductImages, storeDescription, storeSocialMediaAccounts, specificStoreCategories  } = req.body;
        console.log(req.body)

        // Check if the user already exists
        const existingMerchant = await Merchants.findOne({ email });

        if (existingMerchant) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const merchant = new Merchants({
            merchantname: merchantname,
            email: email,
            password: hashedPassword,
            phone:phone,
            country:country,
            Avatar: Avatar,
            storeName: storeName,
            storeAvatar: storeAvatar,
            storeCategory: storeCategory,
            storeSliderImages: storeSliderImages,
            storeProductImages: storeProductImages,
            storeDescription: storeDescription,
            storeSocialMediaAccounts: storeSocialMediaAccounts,
            specificStoreCategories: specificStoreCategories,
        });
        // Save the user to the database
        await merchant.save();

        // Generate JWT token
        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: "1y" });
        console.log(token)
        // Send the token in the response
        res.status(201).send( {email:email,Token: token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const merchantUpdate = async (req, res)=>{
    try{
        const {email,merchantname, password, phone, country} = req.body;
        console.log(merchantname, password,phone, country);
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        ////////////
        const filter = { email: req.params.email };
        console.log(filter)
        const update = { merchantname: merchantname, email: email, password: hashedPassword, phone: phone, country: country};
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        console.log(Merchants)
        console.log(update)
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        console.log(updatedMerchantProfile)
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }
}

const merchantProfile = async (req,res)=>{
    try{
        console.log(req.params.email)
        const merchant = await Merchants.findOne({email:req.params.email});
        console.log(merchant);
        res.status(200).send(merchant);
    }
    catch(err){
        res.status(500).send({Message: err})
    }

}

const uploadStoreAvatar = async (req, res) => {
    console.log("test")
    var email = req.body.email;
    const user = await Merchants.findOne({email:email});
    
     cloudinary.uploader.upload(req.file.path, function(err, result) {
        // console.log(err)
        if(err){
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Error"
            })
        }
        var imageUrl = result.url;
        console.log(email);
        user.storeAvatar = result.url;
        user.save()
        console.log(user);
        // const temp = Users.findOne({email:email});
        // console.log(temp);
        
        
        res.status(200).send({
            success: true,
            message: "Uploaded",
            data: result.url,
            email:email,
        })
    })
    // console.log(req.file.path)
    // res.send({ status: "Success" });
  }

const updateStoreInformation = async (req,res)=>{
    try{
        console.log(req.body)
        const {storeName,storeCategory, storeDescription } = req.body;
        
        const filter = { email: req.params.email };
        const update = { storeName: storeName, storeCategory: storeCategory, storeDescription: storeDescription };
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document

        const updatedUserProfile = await Merchants.findOneAndUpdate(filter, update, options);
        ////////////
        res.status(200).send({Message: "Your store data updated successfuly!",storeName: storeName, storeCategory: storeCategory, storeDescription: storeDescription})
    }catch(error){
        res.status(500).send({Error:error})
    }
}


const connectSocialMediaAccounts = async (req, res)=>{
    console.log(1)
    try{
        console.log(req.body)
        const storeSocialMediaAccounts = req.body.storeSocialMediaAccounts;
        
        const filter = { email: req.params.email };
        const update = { storeSocialMediaAccounts: storeSocialMediaAccounts };
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document

        const updatedUserProfile = await Merchants.findOneAndUpdate(filter, update, options);
        ////////////
        res.status(200).send({Message: "Your store data updated successfuly!",})
    }catch(error){
        res.status(500).send({Error:error})
    }
}


const storeSliderImages = async (req, res) => {
    console.log("test")
    var email = req.body.email;
    const user = await Merchants.findOne({email:email});
    
     cloudinary.uploader.upload(req.file.path, function(err, result) {
        // console.log(err)
        if(err){
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Error"
            })
        }
        // var imageUrl = result.url;
        console.log(email);
        console.log(result.url);
        user.storeSliderImages.push(result.url);
        user.save()
        console.log(user);
        // const temp = Users.findOne({email:email});
        // console.log(temp);
        
        
        res.status(200).send({
            success: true,
            message: "Uploaded",
            data: user,
            email:email,
        })
    })
    // console.log(req.file.path)
    // res.send({ status: "Success" });
  }

  const specificStoreCategories = async (req, res) => {
    try{
        const {email,specificStoreCategories} = req.body;
        console.log(specificStoreCategories,"wwwwwwwwwwwwwwwwwwwwwww")
        console.log(req.body)
        console.log(specificStoreCategories,"wwwwwwwwwwwwwwwwwwwwwww")
        const filter = { email: req.params.email };
        // console.log(filter)
        const update = { $push: {specificStoreCategories: specificStoreCategories}};
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        // console.log(update)
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        console.log(updatedMerchantProfile)
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }
}

// deleteSpecificStoreCategories
const deleteSpecificStoreCategories = async (req,res)=>{
    console.log(1)
    const email = req.params.email;
    const index = req.body.index;
    // console.log(email)
    const specificCategory = await Merchants.findOne({email:email})
    console.log(specificCategory.specificStoreCategories[index])
    console.log(req.body)
    await Merchants.updateOne(
        {email:email},
        { $pull: { specificStoreCategories: {$in: [specificCategory.specificStoreCategories[index]]} } },
        { new: true },
        
      );
      
    console.log(await Merchants.find({email:email}))
    res.send({Result: "Category Deleted Successfully!!"})
}


const updateSpecificStoreCategories = async (req,res)=>{
    try{
        const {email,index,specificCategoryName} = req.body;
        const specificCategory = await Merchants.findOne({email:email});
        const newSpecificCategoryName = specificCategory.specificStoreCategories[index];
        const filter = { email: req.params.email, specificStoreCategories: newSpecificCategoryName };
        console.log("2222222222")
        console.log(email, index, specificCategoryName)
        console.log("2222222222")
        const update = { email: email, specificStoreCategories: specificCategoryName, };
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        console.log(Merchants)
        console.log(update)
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        console.log(updatedMerchantProfile)
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }
}

const deleteSpecificImageFromStoreSlider = async (req,res) =>{
    console.log(1)
    const email = req.params.email;
    const url = req.body.url;
    // console.log(email)
    const specificStore = await Merchants.findOne({email:email})
    // console.log(specificStore);
    console.log(specificStore.storeSliderImages.indexOf(url))
    urlIndex=specificStore.storeSliderImages.indexOf(url);
    // console.log(req.body)
    await Merchants.updateOne(
        {email:email},
        { $pull: { storeSliderImages: {$in: [specificStore.storeSliderImages[urlIndex]]} } },
        { new: true },
        
      );
      
    console.log(await Merchants.find({email:email}))
    res.send({Result: "Category Deleted Successfully!!"})
}

const testSpecificCart = async(req,res)=>{
    try {
        const email = req.params.email
        // Extract necessary information from the request body
        const { cartPrimaryImage ,cartName, cartPrice, cartDiscount, cartLiked, cartPriceAfterDiscount, cartSecondaryImagesSlider, cartDescription, cartCategory, cartFavourite} = req.body;

        // Find the merchant using the provided email
        const merchant = await Merchants.findOne({ email: email });

        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        // Create a new cart using the cart information from the request
        const newCart = new Carts({

            cartName,
            cartPrice,
            cartDiscount,
            cartLiked,
            cartPrimaryImage,
            cartPriceAfterDiscount,
            cartSecondaryImagesSlider,
            cartDescription,
            cartCategory,
            cartFavourite,
            merchant: merchant._id, // Associate the cart with the merchant
        });

        // Save the new cart
        await newCart.save();

        // Update the merchant's type array with the new cart's ObjectId
        merchant.type.push(newCart._id);
        await merchant.save();

        res.status(201).json({ message: "Cart added to merchant successfully", cart: newCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
        
}

const testGetMerchantCart = async(req,res)=>{
    try {
        
        const email = req.params.email
        // Find the merchant using the provided email
        const merchant = await Merchants.findOne({ email: email });

        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const merchantsWithCarts = await Merchants.find({email:email}).populate('type');

        res.status(201).json( merchantsWithCarts[0] );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const testGetMerchantCartContent = async (req,res)=>{
    res.send(await Carts.find({}))
}

const cartUploadPrimaryImage = async(req,res)=>{
    console.log("test")
    var email = req.body.email;
    var index = req.body.index;
    // console.log(email,index)
    const user = await Merchants.findOne({email:email}).populate("type");
    // console.log(user)
     cloudinary.uploader.upload(req.file.path, async function(err, result)  {
        // console.log(err)
        if(err){
            console.log(err);
            return res.status(500).send({
                success: false,
                message: "Error"
            })
        }
        // var imageUrl = result.url;
        console.log(result.url)
        const cartId = user.type[index]._id;
        const cart = await Carts.findByIdAndUpdate(cartId, {
            cartPrimaryImage: result.url,
          });
        
        res.status(200).send({
            success: true,
            message: "Uploaded",
            data: user,
            email:email,
        })
    })
    // console.log(req.file.path)
    // res.send({ status: "Success" });
}

const activateStoreSlider = async(req,res)=>{
    try{
        const {activateSlider} = req.body;
        console.log(activateSlider);

        const filter = { email: req.params.email };
        console.log(filter)
        const update = { activateSlider: activateSlider,};
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        console.log(Merchants)
        console.log(update)
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        console.log(updatedMerchantProfile)
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }
}

const activateStoreCategory = async(req,res)=>{
    try{
        const {activateCategory} = req.body;
        console.log(activateCategory);

        const filter = { email: req.params.email };
        console.log(filter)
        const update = { activateCategory: activateCategory,};
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        console.log(Merchants)
        console.log(update)
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        console.log(updatedMerchantProfile)
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }
}

const activateStoreCarts = async(req,res)=>{
    try{
        const {activateCarts} = req.body;
        console.log(activateCarts);

        const filter = { email: req.params.email };
        console.log(filter)
        const update = { activateCarts: activateCarts,};
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        console.log(Merchants)
        console.log(update)
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        console.log(updatedMerchantProfile)
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }
}

module.exports = {
    getAllUsers,
    getSingleUser,
    addNewUser,
    updateUser,
    deleteUser,
    login,
    register,
    updateUserProfile,
    uploadfile,
    upload,
    getUserProfile,
    merchantLogin,
    merchantRegister,
    merchantUpdate,
    merchantProfile,
    uploadStoreAvatar,
    updateStoreInformation,
    connectSocialMediaAccounts,
    storeSliderImages,
    specificStoreCategories,
    deleteSpecificStoreCategories,
    updateSpecificStoreCategories,
    deleteSpecificImageFromStoreSlider,
    testSpecificCart,
    testGetMerchantCart,
    testGetMerchantCartContent,
    cartUploadPrimaryImage,
    activateStoreSlider,
    activateStoreCategory,
    activateStoreCarts,


}