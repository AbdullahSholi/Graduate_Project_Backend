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
const socketIo = require("socket.io");
const http = require("http");
const users=require("./model/users")


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




app.use(cors({
    origin: 'http://localhost:3000', // or '*' to allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(helmet());

// app.use ( middleware )
app.use(express.json())
app.use(router)

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));

app.get("/test",(req,res)=>{
    res.send("Test Success tttttttttttttttttttttttttt");
})



app.use("/electrohub/api/v1/uploads", express.static(path.join("uploads")));


app.use("*",(req,res,next)=>{
    res.render("index")
})

const server = http.createServer(app);
const io = socketIo(server);
const connectedUser = new Set();



mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to DB Successfully!!");
    server.listen(3000, (req, res) => {
        console.log("Listening on port 3000");
    });
    
    io.on('connection', async (socket) => {
        console.log('Client connected', socket.id);
        io.emit("connected-user", connectedUser. size);
        connectedUser.add(socket.id);
        // let user = await users.find({ });
        // console.log(user);
        let user = await users.findOne({ email: "abdullah@gmail.com" });
        // if (!user) {
        //     // Create a new user if not found
        //     user = new User({ email: "abdullah@gmail.com" });
        // }
        // Push the new chat message into the userChat array
        user.userChat.push({ email:"abdullah@gmail.com", name:"abdullah", messages: ["Hello"] });

        // Save the updated user document
        await user.save();

        socket.on('disconnect', () => {
          console.log('Client disconnected');
          connectedUser.delete(socket.id);
          io.emit("connected-user", connectedUser. size);
        });

        socket.on("message", (data)=>{
            console.log(data);
            socket.broadcast.emit("message-recieve", data);
        })
    });
});


