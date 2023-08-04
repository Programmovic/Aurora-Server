const express = require('express');
const app = express();

const cors = require('cors');
app.use(express.json())
app.use(cors());
const uri = 'mongodb+srv://adam:EPQfpcJi2hwnsCoW@cluster0.ujd6hhy.mongodb.net/Aurora'; // replace with your own MongoDB connection string
const mongoose = require('mongoose');

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB database'))
    .catch((err) => console.error('Error connecting to MongoDB database:', err));

const Message = require("./models/Messages.js")

app.get('/messages', async (req, res) => {
    const messages = await Message.find()
    res.json(messages)
});
app.post('/addmessage', async (req, res) => {

    const message = req.body;
    const newMessage = new Message(message);

    await newMessage.save()
        .then(() => {
            console.log('Project added to MongoDB:', newMessage);
            res.send('Project added to MongoDB');
        })
        .catch((err) => {
            console.error('Error adding project to MongoDB:', err);
            res.status(500).send('Error adding project to MongoDB');
        });
});
app.patch('/messages/:id', async (req, res) => {
    const messageId = req.params.id;
    const newReadStatus = req.body.read;

    try {
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { read: newReadStatus },
            { new: true }
        );

        res.json(updatedMessage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
app.delete('/messages', (req, res) => {
    Message.deleteMany({})
        .then(() => res.status(204).end())
        .catch((error) => res.status(500).json({ error: error.message }));
});
app.delete("/messages/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = Message.findIndex((message) => message.id === id);

    if (index !== -1) {
        Message.splice(index, 1);
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
});
const Rate = require("./models/rates.js")
app.post("/rates", async (req, res) => {
    const rate = req.body;
    const newRate = new Rate(rate);

    await newRate.save()
        .then((savedRate) => {
            res.json(savedRate);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error.message);
        });
});

const Admins = require("./models/Admins.js")
const bcrypt = require('bcrypt');

app.post("/register", async (req, res) => {
    const admin = req.body;

    // Check if admin already exists
    const existingAdmin = await Admins.findOne({ username: admin.username });
    if (existingAdmin) {
        return res.status(409).send('Admin already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(admin.password, saltRounds);

    // Create new admin
    const newAdmin = new Admins({
        username: admin.username,
        password: hashedPassword
    });

    await newAdmin.save()
        .then((savedAdmin) => {
            console.log(savedAdmin)
            res.json(savedAdmin);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error.message);
        });
});
const jwt = require("jsonwebtoken")
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find admin with matching username
    const admin = await Admins.findOne({ username });

    // If admin doesn't exist, send error response
    if (!admin) {
        return res.status(401).send('Invalid username or password');
    }

    // Compare password with hashed password in the database
    const passwordMatch = await bcrypt.compare(password, admin.password);

    // If passwords don't match, send error response
    if (!passwordMatch) {
        return res.status(401).send('Invalid username or password');
    }

    // If username and password are correct, create JWT token
    const token = jwt.sign({ id: admin._id }, "ADAM");

    // Send success response with JWT token
    res.json({ token, adminId: admin._id, admin_name: admin.username });
});
app.get('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find the user by ID
        const user = await Admins.findById(userId);

        // If the message is found, return it in the response
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'user not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/users', async (req, res) => {
    const users = await Admins.find()
    res.json(users)
});


app.listen(3001, () => {
    console.log('Express server listening on port 3001');
});