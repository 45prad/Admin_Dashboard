const connectToMongo = require('./db')
const express = require('express')
const bodyParser = require('body-parser');
const User = require('./models/User');
const sendMail = require('./utils/sendMail');


connectToMongo();
const app = express()
app.use(bodyParser.json());

const port = 5000

app.post('/users', async (req, res) => {
    try {
        // Extract data from the request body
        const emailId = req.body.emailId;

        // Check if a user with the same emailId already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create a new user object
        const newUser = new User({
            emailId,
            linkOpenCount: 0,
            emailOpenCount: 0,
            attachmentOpenCount: 0
        });

        // Save the new user to the database
        await newUser.save();

        // Send a success response
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Defined API endpoint to increment linkOpenCount
app.get('/incrementLinkOpenCount/:userId', async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment the linkOpenCount
        user.linkOpenCount += 1;

        // Save the updated user to the database
        await user.save();

        // Send a success response
        res.status(200).json({ message: 'linkOpenCount incremented successfully', user });
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to handle tracking requests
app.get('/track.gif', async (req, res) => {
    try {
        const { userId } = req.query;

        // Update the user's emailOpenCount in the database
        const user = await User.findById(userId);
        if (user) {
            user.emailOpenCount += 1;
            await user.save();
        }

        // Respond with a 1x1 transparent GIF image
        res.sendFile('pixel.gif', { root: __dirname });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


// Defined API endpoint to send emails
app.post('/send-email', async (req, res) => {
    try {
        // Extract email data from the request body
        // const { to, subject, message } = req.body;

        imageUrl = "http://localhost:5000/track.gif?userId=6617f54df3d0c8cc38c63b8b";

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title></title>
        </head>
        <body>
            <p>Very Important message</p>
            <img src="${imageUrl}" alt="Tracking Pixel">
        </body>
        </html>
        `;
        // Call the sendMail function to send the email
        await sendMail("chinmayrmhatre@gmail.com", "Phishing email", htmlContent);

        // Send a success response
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});



app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})