const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to MongoDB (replace 'mongodb://localhost:27017/mydatabase' with your MongoDB connection string)
mongoose.connect('mongodb+srv://groupgroup00003:Sholi%40971@cluster0.emalawk.mongodb.net/Graduate_Project_Database').then(()=>{
    console.log("Connect")
})

// User schema and model
const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('Users', userSchema);

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
app.get("/Users",authenticateToken,async (req,res)=>{
    const users = await User.find({})
    res.status(200).send({status:"Success",data:req.user})
})

// Registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body)

        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const user = new User({
            email: email,
            password: hashedPassword
        });
        // Save the user to the database
        await user.save();

        // Generate JWT token
        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: 120 });
        console.log(token)
        // Send the token in the response
        res.status(201).send( {Token: token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: 120 });

        // Send the token in the response
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PORT = 3010;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});