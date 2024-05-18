const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "smtp.gmail.com",
    // port: 465,
    // secure: true,
    auth: {
      user: "groupgroup060@gmail.com",
      pass: "mbfrdirdtietclqu",
    },
    debug: true,  // Enable debug output
    logger: true  // Log information in console
  });


  
  // Email options
  const mailOptions = {
    from: "groupgroup060@gmail.com", // Sender address
    to: 'groupgroup060@gmail.com', // List of recipients
    subject: 'Hello from Nodemailer', // Subject line
    text: 'This is a test email sent from a Node.js script using Nodemailer.', // Plain text body
  };
  
  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });
  