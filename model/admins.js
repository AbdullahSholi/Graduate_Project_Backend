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
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Regex pattern for phone numbers starting with Palestinian prefix +970
                return /^(\+970|970|0)?5\d{8}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    Avatar: {
        type: String,
        default: "http://res.cloudinary.com/dsuaio9tv/image/upload/v1708109280/blctf7fxgqai2t8p2lck.png",
    }
});

const Admins = mongoose.model('Admins', adminSchema);

module.exports = Admins;
