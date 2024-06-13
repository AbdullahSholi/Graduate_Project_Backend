const mongoose = require("mongoose");

// Admin schema and model
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 20,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Regex pattern for validating email
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true,
    },
    Avatar: {
        type: String,
        default: "http://res.cloudinary.com/dsuaio9tv/image/upload/v1708109280/blctf7fxgqai2t8p2lck.png",
    },
    allCategories: {
        type: [String],
        default:["All Stores"]
    },
    eachTransactionPercentage:{
        type: Number,
        default: 2.5
    },
    tasks:{
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }

});

const Admins = mongoose.model('Admins', adminSchema);

module.exports = Admins;
