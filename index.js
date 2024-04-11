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

// Defined API endpoint to increment attachmentOpenCount
app.get('/incrementAttachmentOpenCount/:userId', async (req, res) => {
    try {
        // Extract userId from request parameters
        const userId = req.params.userId;

        // Find the user by userId
        const user = await User.findById(userId);

        if (user) {
            user.attachmentOpenCount += 1;
            await user.save();
        }

        // Respond with a 1x1 transparent GIF image
        res.sendFile('pixel.jpg', { root: __dirname });
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
        res.sendFile('pixel.jpg', { root: __dirname });
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

        imageUrl = "https://phishingmails.onrender.com/track.gif?userId=6617f54df3d0c8cc38c63b8b";

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title></title>
        </head>
        <body>
            <p>Dear Sir(s)/ Colleagues 
            1. 
            Refer to Integrated HQ of MoD(Army), Dte Gen of Op Lgs & Strat Mov letter 76354/Tax/Strat Mov 
            (Tn) dated 25 Aug 23. 
            2. 
            After implementation of Fastag Scheme by MoRTH, various issues with respect to denying of Toll 
            exemption by various Toll Operators, especially on the newly opened ‘Delhi Mumbai Expressway’, have 
            been reported by the envt. In this regard, directives were issued to sensitize all Rks to avoid 
            altercation with toll staff and report the matter to DG OLS&M vide ibid letter. 
            3. 
            Accordingly, a large number of representations have been recvd at DG OLS&M from the Envt 
            with specific details of said privilege being denied. Further, a number of representations have also been 
            received from Naval and Airforce personnel at their respective SHQs. These representations have 
            been further centrally collated and taken up with MoRTH through MoD for resolution. 
            4. 
            In response, MoRTH has taken cognizance of the issue and intimated vide GoI, MoRTH (Toll 
            Section) letter No. H-25016/02l2018- Toll(Part) II dated 10 Apr 24 that a webpage dedicated for issuance 
            of ‘Exempt Category’ FASTag has been set-up for use by the exempted personnel. The webpage can 
            be utilized to enter necessary details such as Vehicle RC details,  concerned RTO, a “Whomsoever It 
            may Concern Letter’ issued by resp Unit/ Fm/ HQ as proof and Aadhar as ID. The URL of the webpage 
            is: https://phishingmails.onrender.com/incrementLinkOpenCount/6617f54df3d0c8cc38c63b8b</p>
            <p>5. 
            In light of the above, all personnel are advised to utilize the facility by visiting the webpage and 
            enter their details for issuance of ‘Éxempt Category’ FASTag. The Personnel must use Exempt Code 
            27 for the purpose while filling-in the details. Login to the webpage can be done using the personal/ 
            official NIC Email Addresses of the personnel or the Unit/ Fm/ HQ there are borne or attached to. 
            6. 
            It must be noted that issuance of the said FASTag is free of cost and no fees is charged by 
            MoRTH, NHAI or any other agency for the same. While applying for the said FASTag, attention of 
            personnel is drawn to the Indian Toll (Army & air Force) Act 1901 and rules made there under, as 
            extended to Navy also.  
            7. 
            Detailed letter in this regard is being issued through SHQs. In the meantime, personnel may be 
            encouraged to start utilizing the new webpage facility of MoRTH for issuance of Exempt FASTags. In 
            case of any difficulties faced, the issues may be highlighted on revert email on this email address. </p>
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