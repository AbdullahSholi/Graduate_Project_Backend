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
const Store = require("../model/store")
const IndexModel = require("../model/storeIndex")
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
        console.log(req.body);

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
        const {username, password, phone , country, street} = req.body;
        // console.log(req.body)
        console.log(req.params.email);

        const user = await Users.find({email: req.params.email})
        // console.log(user[0]);
        // var emailDB = user[0].email;
        var usernameDB = user[0].username;
        var passwordDB = user[0].password;
        var phoneDB = user[0].phone;
        var countryDB = user[0].country;
        var streetDB = user[0].street;

        // passwordDB, 10);

        // // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        // ////////////
        const filter = { email: req.params.email };

        const update = { username: username.trim() != "" ? usernameDB = username : usernameDB = usernameDB, 
        password: password.trim() != "" ? passwordDB = hashedPassword : passwordDB = passwordDB,
        phone: phone.trim() != "" ? phoneDB = phone : phoneDB = phoneDB,
        country: country.trim() != "" ? countryDB = country : countryDB = countryDB,
        street: street.trim() != "" ? streetDB = street : streetDB = streetDB
        };
        console.log("-----------");
        console.log(filter);

        // const update = { username: username, email: email, password: hashedPassword, phone: phone, country: country, street: street };
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document

        const updatedUserProfile = await Users.findOneAndUpdate(filter, update, options);
        if (!updatedUserProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "User not found" });
        }
        // console.log(updatedUserProfile);
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

        
        console.log(process.env.JWT_SECRET);
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
        const emailParams = req.params.email
        console.log(emailParams)
        // Get Origin Data from DB
        const merchant = await Merchants.find({email: emailParams})
        console.log(merchant[0]);
        // var emailDB = merchant[0].email;
        var merchantnameDB = merchant[0].merchantname;
        var passwordDB = merchant[0].password;
        var phoneDB = merchant[0].phone;
        var countryDB = merchant[0].country;

        // var hashedPassword0 = await bcrypt.hash(passwordDB, 10);
        
        console.log(merchantnameDB,  phoneDB, countryDB);

        // Get Data Coming from Client 

        var {merchantname, password, phone, country} = req.body;
        // console.log(merchantname, password,phone, country);
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(merchantname, hashedPassword, phone, country);
        
        ////////////
        const filter = { email: emailParams };
        
        const update = { merchantname: merchantname.trim() != "" ? merchantnameDB = merchantname : merchantnameDB = merchantnameDB, 
        password: password.trim() != "" ? passwordDB = hashedPassword : passwordDB = passwordDB,
        phone: phone.trim() != "" ? phoneDB = phone : phoneDB = phoneDB,
        country: country.trim() != "" ? countryDB = country : countryDB = countryDB,
    };

        console.log(update)
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        
        
        const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        //////////
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

        const emailParams = req.params.email
        console.log(emailParams)

        // Get Origin Data from DB
        const merchant = await Merchants.find({email: emailParams})
        console.log(merchant[0]);
        // var emailDB = merchant[0].email;
        var storeNameDB = merchant[0].storeName;
        var storeCategoryDB = merchant[0].storeCategory;
        var storeDescriptionDB = merchant[0].storeDescription;
        
        console.log(storeNameDB, storeCategoryDB, storeDescriptionDB);

        /////////////////////////////

        console.log(req.body)
        const {storeName,storeCategory, storeDescription } = req.body;
        
        const filter = { email: req.params.email };


        const update = { storeName: storeName.trim() != "" ? storeNameDB = storeName : storeNameDB = storeNameDB, 
        storeCategory: storeCategory.trim() != "" ? storeCategoryDB = storeCategory : storeCategoryDB = storeCategoryDB,
        storeDescription: storeDescription.trim() != "" ? storeDescriptionDB = storeDescription : storeDescriptionDB = storeDescriptionDB,
        };

        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document

        const updatedUserProfile = await Merchants.findOneAndUpdate(filter, update, options);
        ////////////
        res.status(200).send({Message: "Your store data updated successfuly!",storeName: storeName, storeCategory: storeCategory, storeDescription: storeDescription})
    }catch(error){
        res.status(500).send({Error:error})
    }

    ///////////////////////
    

    ////////////////
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
        specificCategory.specificStoreCategories[index] = specificCategoryName;
        await specificCategory.save()
        // const update = { specificStoreCategories: specificCategoryName, };
        // const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        console.log(Merchants)
        // console.log(update)
        // const updatedMerchantProfile = await Merchants.findOneAndUpdate(filter, update, options);
        
        // console.log(updatedMerchantProfile)
        // if (!updatedMerchantProfile) {
        //     // Handle the case where the merchant with the given email was not found
        //     return res.status(404).send({ Message: "Merchant not found" });
        // }
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
        const { cartPrimaryImage ,cartName, cartPrice, cartDiscount, cartLiked, cartPriceAfterDiscount, cartSecondaryImagesSlider, cartDescription, cartCategory, cartFavourite, cartQuantities} = req.body;

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
            cartQuantities,
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

const cartUploadSecondaryImages = async (req,res)=>{
    {
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
                $push: {cartSecondaryImagesSlider: result.url},
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
}

const deleteSpecificImageFromCartImageSlider = async(req,res)=>{
    console.log(1)
    const email = req.params.email;
    const url = req.body.url;
    const index = req.body.index;
    
    
    const specificStore = await Merchants.findOne({email:email}).populate("type")
    // console.log(specificStore);
    const cartId = specificStore.type[index]._id;
            const cart = await Carts.findByIdAndUpdate(cartId, {
                $pull: {cartSecondaryImagesSlider: url},
              });
      
    console.log(await Carts.findById(cartId))
    res.send({Result: "Category Deleted Successfully!!"})
}


function isEmptyString(value) {
    return typeof value === 'string' && value.trim() === '';
  }


const testUpdateSpecificCart = async (req,res)=>{

    ///////////////
    try{
        const index = req.body.index;
        const emailParams = req.params.email
        console.log(emailParams)
        // Get Origin Data from DB
        const merchant = await Merchants.findOne({email: emailParams}).populate("type")
        console.log(merchant.type);
        // var emailDB = merchant[0].email;
        
        var cartNameDB = merchant.type[index].cartName;
        var cartPriceDB = merchant.type[index].cartPrice;
        var cartDiscountDB = merchant.type[index].cartDiscount;
        var cartLikedDB = merchant.type[index].cartLiked;
        var cartFavouriteDB = merchant.type[index].cartFavourite;
        var cartDescriptionDB = merchant.type[index].cartDescription;
        var cartCategoryDB = merchant.type[index].cartCategory;
        var cartQuantitiesDB = merchant.type[index].cartQuantities;
        var cartRateDB = merchant.type[index].cartRate;
        
        
        console.log(cartNameDB);
        console.log(cartPriceDB);
        console.log(cartDiscountDB);
        console.log(cartLikedDB);
        console.log(cartFavouriteDB);
        console.log(cartDescriptionDB);
        console.log(cartCategoryDB);
        console.log(cartQuantitiesDB);
        console.log(cartRateDB);

        // Get Data Coming from Client 

        var {cartName, cartPrice, cartDiscount, cartLiked, cartFavourite, cartDescription, cartCategory, cartQuantities,  cartRate} = req.body;
        
        console.log("++++++++++++++++++++++++++++++");
        console.log(req.body);
        console.log("++++++++++++++++++++++++++++++");

        
        ////////////
        const filter = { email: emailParams };
        
        const update = {  
            cartName: cartName.trim() != "" ? cartNameDB = cartName : cartNameDB = cartNameDB, 
            cartPrice: cartPrice != "" ? cartPriceDB = cartPrice : cartPriceDB = cartPriceDB, 
            cartDescription: cartDescription.trim() != "" ? cartDescriptionDB = cartDescription : cartDescriptionDB = cartDescriptionDB, 
            cartCategory: cartCategory.trim() != "" ? cartCategoryDB = cartCategory : cartCategoryDB = cartCategoryDB, 
            cartQuantities: cartQuantities != "" ? cartQuantitiesDB = cartQuantities : cartQuantitiesDB = cartQuantitiesDB,
            cartRate: cartRate != "" ? cartRateDB = cartRate : cartRateDB = cartRateDB,
            cartDiscount: cartDiscount,
            cartLiked: cartLiked, 
            cartFavourite: cartFavourite,
        
         };

        console.log(update)
        const options = { new: true, upsert: true }; // Set `new` to true to return the updated document
        
            const cartId = merchant.type[index]._id;
        
        const updatedMerchantProfile = await Carts.findOneAndUpdate(cartId, update, options);
        
        
        if (!updatedMerchantProfile) {
            // Handle the case where the merchant with the given email was not found
            return res.status(404).send({ Message: "Merchant not found" });
        }
        ////////
        res.status(200).send({Message: "Your profile data updated successfuly!"})
    }catch(error){
        console.error(error);
        res.status(500).send({Error:error})
    }



}

const deleteCart = async (req,res)=>{
    console.log(1)
    const email = req.params.email;
    const index = req.body.index;
    
    
    const specificStore = await Merchants.findOne({email:email}).populate("type")
    // console.log(specificStore);
    const cartId = specificStore.type[index]._id;
            const cart = await Carts.findByIdAndDelete(cartId);
      
    console.log(await Carts.find({}))
    res.send({Result: "Cart Deleted Successfully!!"})
}


const deleteCategoryConnectedToCarts = async (req,res)=>{

    console.log(1)
    const email = req.params.email;
    const index = req.body.index;
    
    console.log(email, index)
    
    const specificStore = await Merchants.findOne({email:email}).populate("type")
    // console.log(specificStore);
    console.log(specificStore.type)
    for(i=0; i < specificStore.type.length; i++){
        if(specificStore.type[i].cartCategory == specificStore.specificStoreCategories[index]){
            const cartId = specificStore.type[i]._id;
            const cart = await Carts.findByIdAndDelete(cartId);
            await Merchants.updateOne(
                {email:email},
                { $pull: { type: {$in: [specificStore.type[i]]} } },
                { new: true },
                
              );
        }
    }
    

    const specificCategory = await Merchants.findOne({email:email})
    await Merchants.updateOne(
        {email:email},
        { $pull: { specificStoreCategories: {$in: [specificCategory.specificStoreCategories[index]]} } },
        { new: true },
        
      );
      
    // console.log(await Merchants.find({email:email}))
    res.send({Result: "Category Deleted Successfully!!"})
}


const merchantAddStoreToDatabase = async (req,res)=>{
    try {
        const emailParams = req.params.email
        // Extract necessary information from the request body
        const { merchantname, email, phone, country, Avatar, storeName, storeAvatar, storeCategory, storeSliderImages, storeProductImages, storeDescription, storeSocialMediaAccounts, activateSlider, activateCategory, activateCarts, specificStoreCategories, type} = req.body.stores;
    //    console.log(req.body.stores)
       console.log("--------------------------")
       console.log("--------------------------")
       console.log("--------------------------")

        // Find the existing document
        let storeDocument = await Store.findOne({}); // Assuming there's only one document
        
        // If no document found, create a new one
        if (!storeDocument) {
            storeDocument = new Store(

            );
            console.log("Store Created!!")
        }
        let counter = 0; 
        // console.log(storeDocument.stores)
        // console.log("--------------------------")
        // console.log("--------------------------")

        for(let i = 0; i<storeDocument.stores.length; i++){
            if(storeDocument.stores[i].email == emailParams){
                counter++;
            } else{
                counter=0;
            }
        }
        console.log(counter)
        if(counter != 0){
            if(counter == 1){
                console.log(emailParams)
                const tempStore = await Store.findOne({});
                // console.log(tempStore.stores)
                for(let i=0; i<tempStore.stores.length; i++){
                    if(tempStore.stores[i].email == emailParams){

                        let foundObject = tempStore.stores.find(obj => obj.email === emailParams);
                        if (foundObject) {
                            foundObject.merchantname= merchantname;
                            foundObject.email= emailParams;
                            foundObject.phone= phone;
                            foundObject.country =country;
                            foundObject.Avatar = Avatar;
                            foundObject.storeName = storeName;
                            foundObject.storeAvatar = storeAvatar;
                            foundObject.storeCategory = storeCategory;
                            foundObject.storeSliderImages = storeSliderImages;
                            foundObject.storeProductImages = storeProductImages;
                            foundObject.storeDescription = storeDescription;
                            foundObject.storeSocialMediaAccounts = storeSocialMediaAccounts;
                            foundObject.activateSlider = activateSlider;
                            foundObject.activateCategory = activateCategory;
                            foundObject.activateCarts = activateCarts;
                            foundObject.specificStoreCategories=specificStoreCategories,
                            // foundObject.type = type,
                            console.log("---------==")
                            console.log(foundObject)
                            Store.findOneAndUpdate(
                                {email: emailParams},
                                { $set: { "stores": foundObject } },
                                { new: true },
                            )
                            console.log("Object updated successfully!");
                            await tempStore.save();
                            return res.send({Message: "This store data is exist, You can update it"})
                        } else {
                            console.log("Object with specified ID not found!");
                            return res.send({Message: "Object with specified ID not found!"});
                        }
                       
                         
                    } 
                }
                
                     
            } else
            res.send({Message: "This store data is exist"})
        } 
        else{
        // Push the new store object into the stores array
        console.log("PPPPPPPPPPPPPPPPPPPP")
        console.log(req.body.stores)
        console.log("PPPPPPPPPPPPPPPPPPPP")
    
        storeDocument.stores.push(
            {
            merchantname: merchantname,
            email: emailParams,
            phone: phone,
            country: country,
            Avatar: Avatar,
            storeName: storeName,
            storeAvatar: storeAvatar,
            storeCategory: storeCategory,
            storeSliderImages: storeSliderImages,
            storeProductImages: storeProductImages,
            storeDescription: storeDescription,
            storeSocialMediaAccounts: storeSocialMediaAccounts,
            activateSlider: activateSlider,
            activateCategory: activateCategory,
            activateCarts: activateCarts, 
            specificStoreCategories: specificStoreCategories,
            // type: type,
        }
        );

        // Save the document
        await storeDocument.save();
               
      
        

        res.status(201).json({ message: "Cart added to List of Stores successfully" });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllStores = async (req,res)=>{
    const stores = await Store.find({});
    console.log(stores)
    if(stores.length == 0){
        console.log("No any Store")
        res.send({Message: "No any Store"})
    } 
    else
        res.send(stores[0].stores);
}

const getAllStoresForOneCategory = async (req,res)=>{
    const storeCategory = req.params.storeCategory;
    const stores = await Store.find();
    var tempStores = stores[0].stores.filter(element=> element.storeCategory == storeCategory)
    res.send(tempStores)
}

const storeData = async (req,res)=>{
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

const testGetStoreCart = async (req,res)=>{
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

const getAllCartsForOneCategory = async(req,res)=>{
    const email = req.query.email;
    const cartCategory = req.query.cartCategory;
    const carts = await Merchants.find({email:email}).populate("type");
    // console.log(carts[0].type)
    var tempCarts = carts[0].type.filter(element=> element.cartCategory== cartCategory)
    res.send(tempCarts)
}

const deleteStore = async (req,res)=>{
    const tempStore = await Store.findOne()
    console.log(tempStore.stores.length)
    if(tempStore.stores.length != 0){
        console.log(req.params.email)
        console.log(tempStore)
        const store = tempStore.stores.filter(store=>store.email!=req.params.email)
        tempStore.stores = store;
        await tempStore.save()
        console.log(tempStore.stores)
        await Merchants.findOneAndDelete({email: req.params.email})
        res.send({Message: "The store deleted successfuly"})
    } else{
    console.log("No store to delete")
    res.send({Message: "No store to delete"})
    }
    
}

const addPaymentMethod = async (req,res)=>{
    console.log(req.params.email);
    console.log(req.body);
    const merchant = await Merchants.find({email:req.params.email});
    await Merchants.findOneAndUpdate({email:req.params.email},{"publishableKey": req.body.publishableKey, "secretKey": req.body.secretKey}, { new: true })
    res.send({Message: "Payment informations added successfully!!"});
}

const getPaymentMethod = async (req, res)=>{
    const merchants = await Merchants.find({email:req.params.email});
    res.send(merchants[0]);
}

const customerAddToFavoriteList = async (req, res) =>{
    const user = await Users.find({ email: req.params.email });

    const isProductInFavoriteList = user[0].favouriteList.filter(element => element.cartName == req.body.favouriteList.cartName);

        if(isProductInFavoriteList.length != 0) {
            // console.log(element);
            const fromDifferentStores = user[0].favouriteList.filter(element => element.merchant == req.body.favouriteList.merchant);
            if(fromDifferentStores != 0)
                res.send({Message: "This product is exist in your favorite list"});
            else {
                user[0].favouriteList.push(req.body.favouriteList)
                await user[0].save();
                console.log(user);
                res.send({Message: "This product is added to favorite list successfully!"});
            }
        } else {
            user[0].favouriteList.push(req.body.favouriteList)
            await user[0].save();
            console.log(user);
            res.send({Message: "This product is added to favorite list successfully!"});
        }

    
    // console.log(temp);
    
    // // const user = await Users.find({ email: req.params.email });
    
}

const getCustomerFavoriteList = async (req, res) =>{
    const user = await Users.find({ email: req.params.email });
    console.log(user[0].favouriteList);
    res.send(user[0].favouriteList);
}

const deleteProductFromFavoriteList = async (req, res)=>{
    const index = req.body.index;
    const user = await Users.find({ email: req.params.email });
    user[0].favouriteList.splice(index, 1)
    await user[0].save();
    console.log(user[0].favouriteList);
    
    res.send("success");
}


const deleteProductFromFavoriteListFromDifferentStores = async (req, res)=>{
    try {
    const user = await Users.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // console.log(user);

        // Filter out the product with the specified cartName and merchant
        const temp = user.favouriteList.findIndex(element => 
            element.cartName == req.body.cartName && element.merchant == req.body.merchant
        );

        user.favouriteList.splice(temp, 1)
        // console.log(temp);
        // console.log(user.favouriteList);

        // Save the updated user document
        await user.save();

        // console.log(user.favouriteList);
        res.send({ Message: "Product deleted from favorite list successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
}

}

const addStoreIndex = async (req, res) =>{
    
    try {
        await IndexModel.deleteMany({});
        console.log("++++++++++++++++++++++++++++++++");
        console.log(req.body.index);
        const filter = { value: req.body.index };
        const update = { value: req.body.index };
        const options = { upsert: true, new: true };
    
        const result = await IndexModel.findOneAndUpdate(filter, update, options);
        await result.save();
        console.log('Index created or updated:', result);
        res.send(result);
    } catch (error) {
        console.error('Error creating or updating index:', error);
    }
      
}

const getStoreIndex = async (req, res) =>{
    
    try {
        const index = await IndexModel.findOne({});
        res.send(index);
    } catch (error) {
        console.error('Error creating or updating index:', error);
    }
      
}

const customerGetFavoriteProductsDependOnCategory = async (req, res)=>{

    ////////////////////////////////////////////////////////////////////// get all store Products

    try {
        let commonElement = [] ;
        let commonElement1 = [] ;
        let commonElementForFind = [] ;
        const cartCategory = req.query.cartCategory;
        
        const email = req.query.email
        // Find the merchant using the provided email
        const merchant = await Merchants.findOne({ email: email });

        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const merchantsWithCarts = await Merchants.find({email:email}).populate('type');

        const allStoreCarts = merchantsWithCarts[0].type;
        console.log("!!!!!");
        // console.log(allStoreCarts);
        console.log("!!!!!");

        /////////////////////////////////////////////////////////////////////  get Favorite List
        const user = await Users.find({ email: req.query.customerEmail });
        console.log("######");
        // console.log(user[0].favouriteList);
        console.log("######");
        // res.send(user[0].favouriteList);

        const favoriteList = user[0].favouriteList;
        console.log(favoriteList);

        /////////////////////////////////////////////////////////////////////

        for(let i = 0; i < favoriteList.length; i++){
            for(let j = 0; j < allStoreCarts.length; j++) {
              if(favoriteList[i].cartName == allStoreCarts[j].cartName && favoriteList[i].merchant == allStoreCarts[j].merchant){
                commonElement.push(favoriteList[i]);
              }
            }
          }
          for(let i = 0; i < favoriteList.length; i++){
            for(let j = 0; j < allStoreCarts.length; j++) {
              if(favoriteList[i].cartName == allStoreCarts[j].cartName && favoriteList[i].merchant == allStoreCarts[j].merchant){
                commonElementForFind.push(favoriteList[i].cartName);
              }
            }
          }
        
        commonElement1 = allStoreCarts.filter((element) => !commonElementForFind.includes(element.cartName));

        // console.log(commonElement);
        // console.log(commonElement1);

        var combinedArray = [...commonElement, ...commonElement1];
        combinedArray = combinedArray.filter(element => element.cartCategory == cartCategory )
        console.log(combinedArray);
        console.log(combinedArray.length);


        res.status(201).json( combinedArray );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    
    

}


const customerAddToCartList = async (req, res)=>{
    const user = await Users.find({ email: req.params.email });
    // console.log(req.body.cartList);
    const cartListObj = req.body.cartList;
    cartListObj.quantities = req.body.quantities;
    console.log(cartListObj);



    const isProductInCartList = user[0].cartList.filter(element => element.cartName == cartListObj.cartName);

        if(isProductInCartList.length != 0) {
            // console.log(element);
            const fromDifferentStores = user[0].cartList.filter(element => element.merchant == cartListObj.merchant);
            if(fromDifferentStores != 0)
                res.send({Message: "This product is exist in your favorite list"});
            else {
                user[0].cartList.push(cartListObj)
                await user[0].save();
                console.log(user);
                res.send({Message: "This product is added to favorite list successfully!"});
            }
        } else {
            user[0].cartList.push(cartListObj)
            await user[0].save();
            console.log(user);
            res.send({Message: "This product is added to favorite list successfully!"});
        }

    
    // console.log(temp);
    
    // // const user = await Users.find({ email: req.params.email });
}


const getCustomerCartList = async ( req, res)=>{
    const user = await Users.find({ email: req.params.email });
    console.log(user[0].cartList);
    res.send(user[0].cartList);
}


const deleteProductFromCartListFromDifferentStores = async ( req, res )=>{
    try {
        const user = await Users.findOne({ email: req.params.email });
            if (!user) {
                return res.status(404).send('User not found');
            }
    
            // console.log(user);
    
            // Filter out the product with the specified cartName and merchant
            const temp = user.cartList.findIndex(element => 
                element.cartName == req.body.cartName && element.merchant == req.body.merchant
            );
    
            user.cartList.splice(temp, 1)
            // console.log(temp);
            // console.log(user.favouriteList);
    
            // Save the updated user document
            await user.save();
    
            // console.log(user.favouriteList);
            res.send({ Message: "Product deleted from cart list successfully!" });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
    }
}

const customerPayForProducts = async (req, res) => {
    try {
        let temp = [];
        // Fetch user data based on email
        const user = await Users.findOne({ email: req.params.email });
        console.log(user.cartList);
        for(let i=0; i<user.cartList.length; i++){
            const merchantId= user.cartList[i].merchant; // need modify index
            console.log(merchantId);
            const merchant = await Merchants.findById(merchantId);
            console.log(merchant.publishableKey);
            console.log(merchant.secretKey);
            console.log(merchant);
            temp.push({email: merchant.email, publishableKey: merchant.publishableKey, secretKey: merchant.secretKey, merchant: merchant.id })
        }
        res.send(temp);
    } catch (error) {
        console.error('Error populating merchant data:', error);
        throw error;
    }
}

const deleteAllProductsFromCartList = async ( req, res )=>{
    try {
        const user = await Users.findOne({ email: req.params.email });
            if (!user) {
                return res.status(404).send('User not found');
            }
            user.cartList = [];
            
            await user.save();
            console.log(user);
    
            // console.log(user.favouriteList);
            res.send({ Message: "All Products Deleted successfully!" });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
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
    cartUploadSecondaryImages,
    deleteSpecificImageFromCartImageSlider,
    testUpdateSpecificCart,
    deleteCart,
    deleteCategoryConnectedToCarts,
    merchantAddStoreToDatabase,
    getAllStores,
    getAllStoresForOneCategory,
    storeData,
    testGetStoreCart,
    getAllCartsForOneCategory,
    deleteStore,
    addPaymentMethod,
    getPaymentMethod,
    customerAddToFavoriteList,
    getCustomerFavoriteList,
    deleteProductFromFavoriteList,
    deleteProductFromFavoriteListFromDifferentStores,
    addStoreIndex,
    getStoreIndex,
    customerGetFavoriteProductsDependOnCategory,
    customerAddToCartList,
    getCustomerCartList,
    deleteProductFromCartListFromDifferentStores,
    customerPayForProducts,
    deleteAllProductsFromCartList


}