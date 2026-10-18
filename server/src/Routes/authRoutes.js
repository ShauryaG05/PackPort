const express = require("express");
const bcrypt = require("bcrypt")
const router = express.Router();
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const generateCode = require("../scripts/agentCode")

const getCookieOptions = (req) => {
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    const isProduction = process.env.NODE_ENV === "production" || isHttps;
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
};

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
                    const cookieOptions = getCookieOptions(req);
                    return res.cookie("accessToken", token, cookieOptions).status(200).json({
                        success: true,
                        message: "User created successfully",
                        token,
                        user: { id: user._id, name: user.name, email: user.email, agentCode: user.agentCode }
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
                const cookieOptions = getCookieOptions(req);
                return res.cookie("accessToken", token, cookieOptions).status(200).json({
                    success: true,
                    message: "Login Successfull",
                    token,
                    user: { id: user._id, name: user.name, email: user.email, agentCode: user.agentCode }
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
})

router.get("/check", async (req, res) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = req.cookies?.accessToken || bearerToken;
    if (token) {
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ email: data.email }).select("-password");
            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: "User not found"
                });
            }
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

router.get("/logout", (req, res) => {
    const cookieOptions = getCookieOptions(req);
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        path: "/"
    });

    return res.status(200).json({
        success: true,
        message: "Logout Successfull"
    });
});

module.exports = router;
