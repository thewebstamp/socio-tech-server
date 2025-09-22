import db from "../lib/dbConnection.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";

//BEGIN SIGNUP CONTROLLER
export const beginSignup = (req, res) => {
    const { email, password } = req.body;
    const profile_picture = "user-min.png";
    const cover_photo = "welcome-min.jpg";
    const q = "SELECT * FROM users WHERE email = ?";
    //Check if email already exist in database
    db.query(q, [email], (err, data) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (data.length > 0) {
            return res.status(409).json({ error: "A user with this email already exist" });
        }
        //Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        //Store user details in database
        const qu = "INSERT INTO users (email, password, profile_picture, cover_photo) VALUES (?, ?, ?, ?)";
        db.query(qu, [email, hashedPassword, profile_picture, cover_photo], (err, data) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.status(200).json(email);
        });
    });
};

//FINISH SIGNUP CONTROLLER
export const finishSignup = (req, res) => {
    const { fullname, username, email } = req.body;
    const q = "SELECT * FROM users WHERE username = ?";
    //Check if username already exist
    db.query(q, [username], (err, data) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (data[0]) {
            return res.status(409).json({ error: "Username has been taken, try something else" });
        }

        const que = "UPDATE users SET name = ?, username = ? WHERE email = ?";
        //Update user details
        db.query(que, [fullname, username, email], (err, data) => {
            if (err) {
                return res.status(500)
                    .json({ error: err });
            };

            //Sign in user
            const qu = "SELECT * FROM users WHERE email = ?";
            db.query(qu, [email], (err, data) => {
                if (err) {
                    return res.status(500)
                        .json({ error: err });
                }

                //Create user token
                const token = jwt.sign({ id: data[0].id }, 'secretKey');
                const { password: _, ...others } = data[0];
                res.cookie("accessToken", token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax'
                })
                    .status(200)
                    .json(others)
            });
        });
    })
};

//LOGIN CONTROLLER
export const login = (req, res) => {
    const { username, password } = req.body;
    const q = "SELECT * FROM users WHERE username = ? OR email = ?";
    //Check if the username/email is valid
    db.query(q, [username, username], (err, data) => {
        if (err) {
            return res.status(500)
                .json({ error: err });
        }
        if (data.length === 0) {
            return res.status(404)
                .json({ error: "Email/Username is not yet registered" });
        }

        //Check if password is correct
        const checkPassword = bcrypt.compareSync(password, data[0].password);
        if (!checkPassword) {
            return res.status(401)
                .json({ error: "Incorrect password" });
        }
        const token = jwt.sign({ id: data[0].id }, 'secretKey');
        const { password: _, ...others } = data[0];
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        })
            .status(200)
            .json(others)
    });
};

//LOGOUT CONTROLLER
export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        secure: true,
        sameSite: "none"
    })
        .status(200)
        .json("You just logged out successfully");
};

// GOOGLE LOGIN / SIGNUP
const client = new OAuth2Client("602971994262-auljsiafq3dmrrer40pg5q676hfr50cl.apps.googleusercontent.com");

export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body; // ID token from frontend
        const ticket = await client.verifyIdToken({ idToken: token, audience: "602971994262-auljsiafq3dmrrer40pg5q676hfr50cl.apps.googleusercontent.com" });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name } = payload;

        // Check if user exists
        const q = "SELECT * FROM users WHERE google_id = ? OR email = ?";
        db.query(q, [google_id, email], (err, data) => {
            if (err) return res.status(500).json({ error: err });

            if (data.length > 0) {
                // Existing user → login
                const token = jwt.sign({ id: data[0].id }, "secretKey");
                const { password, ...others } = data[0];
                return res.cookie("accessToken", token, { httpOnly: true }).status(200).json(others);
            } else {
                // New user → insert
                const cover_photo = "welcome-min.jpg";
                const profile_picture = "user-min.png";
                const username = email.split("@")[0];
                const insertQ = "INSERT INTO users (google_id, email, name, username, profile_picture, cover_photo) VALUES (?, ?, ?, ?, ?, ?)";
                db.query(insertQ, [google_id, email, name, username, profile_picture, cover_photo], (err, result) => {
                    if (err) return res.status(500).json({ error: err });

                    //Sign in user
                    const qu = "SELECT * FROM users WHERE email = ?";
                    db.query(qu, [email], (err, data) => {
                        if (err) {
                            return res.status(500)
                                .json({ error: err });
                        }

                        //Create user token
                        const token = jwt.sign({ id: data[0].id }, 'secretKey');
                        const { password: _, ...others } = data[0];
                        res.cookie("accessToken", token, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'lax'
                        })
                            .status(200)
                            .json(others)
                    });
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Invalid Google token" });
    }
};