// import Packages
const express = require("express")
const session = require("express-session")
const router = require("./routes/route")
const mongoose = require("mongoose")
const path = require("path");
const multer = require("multer");
const { error } = require("console");
const cors = require("cors")
require("dotenv").config()

const app = express()
const port = 3000

app.use(cors())

console.log("Containerized . . . . .  . . . . . ")

// app.use ( middleware )
app.use(express.json())
app.use(router)

// ejs 
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get("/test",(req,res)=>{
    res.send("Test Success tttttttttttttttttttttttttt");
})

app.use("/electrohub/api/v1/uploads", express.static(path.join("uploads")));


app.use("*",(req,res,next)=>{
    setTimeout(() => {
        res.render('index');
    }, 2000);
})


mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to DB Successfully!!");
    app.listen(3000, (req, res) => {
        console.log("Listening on port 3000");
    });
});


