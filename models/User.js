const mongoose = require('mongoose');

// Define a schema for user data
const userSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
        unique: true // Assuming each email is unique
    },
    linkOpenCount: {
        type: Number,
        default: 0 // Default value is 0
    },
    emailOpenCount: {
        type: Number,
        default: 0 // Default value is 0
    },
    attachmentOpenCount: {
        type: Number,
        default: 0 // Default value is 0
    },
    submittedData: {
        type: Number,
        default: 0
    },
    reportedSpam: {
        type: Boolean,
        default: false
    }
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
