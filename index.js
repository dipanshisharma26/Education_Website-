const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Importing Models
const UserModel = require("./models/UserModel");

// MongoDB connection
mongoose
    .connect("mongodb://localhost:27017/Education")
    .then(() => {
        console.log("Database Collection Successful");
    })
    .catch((err) => {
        console.log(err);
    });

// Create Express App
const app = express();
app.use(express.json());
app.use(cors());

// Register Endpoint
app.post("/register", (req, res) => {
    let user = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        if (!err) {
            bcrypt.hash(user.password, salt, async (err, hpass) => {
                if (!err) {
                    user.password = hpass;
                    try {
                        let doc = await UserModel.create(user);
                        res.status(201).send({ message: "User Registered" });
                    } catch (err) {
                        console.log(err);
                        res.status(500).send({ message: "Some Problem" });
                    }
                } else {
                    res.status(500).send({ message: "Error hashing password" });
                }
            });
        } else {
            res.status(500).send({ message: "Error generating salt" });
        }
    });
});

// Login Endpoint
app.post("/login", async (req, res) => {
    let userCred = req.body;

    try {
        const user = await UserModel.findOne({ name: userCred.name });
        if (user !== null) {
            bcrypt.compare(userCred.password, user.password, (err, success) => {
                if (err) {
                    return res
                        .status(500)
                        .send({ message: "Error during password comparison" });
                }
                if (success) {
                    jwt.sign({ name: userCred.name }, "educationapp", (err, token) => {
                        if (!err) {
                            res.status(200).send({
                                message: "Login Success",
                                token: token,
                                userid: user._id,
                                name: user.name,
                            });
                        } else {
                            res.status(500).send({ message: "Error generating token" });
                        }
                    });
                } else {
                    res.status(403).send({ message: "Incorrect password" });
                }
            });
        } else {
            res.status(404).send({ message: "No user exists with this email" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Some Problem" });
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});
