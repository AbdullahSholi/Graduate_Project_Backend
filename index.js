// import Packages
const express = require("express")
const session = require("express-session")
const router = require("./routes/route")
const mongoose = require("mongoose")
const path = require("path");
const multer = require("multer");
const { error } = require("console");
const cors = require("cors")
const helmet = require("helmet");
const { RateLimiterMemory } = require('rate-limiter-flexible');
const rateLimit = require('express-rate-limit');


require("dotenv").config()

const app = express()
const port = 3000

const rateLimiter = new RateLimiterMemory({
    points: 10, // maximum number of requests allowed
    duration: 1, // time frame in seconds
  });
  const rateLimiterMiddleware = (req, res, next) => {
     rateLimiter.consume(req.ip)
        .then(() => {
            // request allowed, 
            // proceed with handling the request
            next();
        })
        .catch(() => {
            // request limit exceeded, 
            // respond with an appropriate error message
            res.status(429).send('Too Many Requests');
        });
     };

app.use(rateLimiterMiddleware);




app.use(cors())
app.use(helmet());

// app.use ( middleware )
app.use(express.json())
app.use(router)

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get("/test",(req,res)=>{
    res.send("Test Success tttttttttttttttttttttttttt");
})

app.use("/electrohub/api/v1/uploads", express.static(path.join("uploads")));


app.use("*",(req,res,next)=>{
    res.render("index")
})


mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to DB Successfully!!");
    app.listen(3000, (req, res) => {
        console.log("Listening on port 3000");
    });
});


