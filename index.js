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


// app.use ( middleware )
app.use(express.json())
app.use(router)

console.log(process.env.MONGO_URL)

app.get("/test",(req,res)=>{
    res.send("Test Success");
})

app.use("/electrohub/api/v1/uploads", express.static(path.join("uploads")));
app.use("*",(req,res,next)=>{
    res.send("Not Found")
})


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: false, // Disable SSL validation
}).then(() => {
    console.log("Connected to DB Successfully!!");
    app.listen(3000, (req, res) => {
        console.log("Listening on port 3000");
    });
});


