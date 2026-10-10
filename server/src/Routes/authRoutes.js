const express = require("express");
const bcrypt = require("bcrypt")
const router = express.Router();
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const generateCode = require("../scripts/agentCode")

router.post("/signup", async (req, res) => {

    const { name, email, password } = req.body;
    const confirm_password = req.body.confirm_password || req.body.confirmPassword;
    try {
        if (!name || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        else {

            const user = await User.findOne({ email: email })
            if (user) {
                res.status(400).json({
                    success: false,
                    message: "User already exist",
                })
            }
            else {
                if (password === confirm_password) {
                    const hassedPassword = await bcrypt.hash(password, 10)

                    const code = generateCode();


                    const user = await User.create({
                        name: name,
                        email: email,
                        password: hassedPassword,
                        agentCode: code
                    })
                    const token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, { expiresIn: "100h" })
                    return res.cookie("accessToken", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        maxAge: 24 * 60 * 60 * 1000
                    }).status(200).json({
                        success: true,
                        message: "User created successfully",
                        user: { id: user._id, name: user.name, email: user.email }
                    })
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: "Passwords do not match"
                    })
                }

            }
        }

    }
    catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        })
    }

})

router.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Invalid User Credentials"
            })
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (isPasswordValid) {
                const token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, { expiresIn: "100h" })
                res.cookie("accessToken", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 24 * 60 * 60 * 1000
                }).status(200).json({
                    success: true,
                    message: "Login Successfull"
                })
            } else {
                res.status(401).json({
                    success: false,
                    message: "Invalid Credentials"
                })
            }
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }
    // res.json({message : "login route called"})
})

router.get("/check", async (req, res) => {
    const token = req.cookies?.accessToken;
    if (token) {
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ email: data.email }).select("-password");
            return res.status(200).json({
                status: true,
                user
            });
        } catch (err) {
            return res.status(403).json({
                status: false,
                message: "Forbidden"
            });
        }
    } else {
        return res.status(401).json({
            status: false,
            message: "Unauthorized"
        });
    }
});

router.get("/logout",(req,res)=>{

    res.status(200).clearCookie("accessToken").json({
        success: true,
        message: "Logout Successfull"
    })

})

module.exports = router;
