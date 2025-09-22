import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';

//Connect with a User
export const Connect = (req, res) => {
    const q = "INSERT INTO relationship (follower_id, followed_id, created_at) VALUES (?, ?, NOW())";
    const token = req.cookies.accessToken;
    const { followed_id } = req.body;

    if (!token) { return res.status(401).json({ error: "Unauthorized user" }) }

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { res.status(403).json({ error: "Invalid token" }) }

        db.query(q, [userInfo.id, followed_id], (err, data) => {
            if (err) { res.status(500).json(data) }
            res.status(200).json("You successfully connected with a user")
        });
    })
};

//Disconnect with a User
export const disconnect = (req, res) => {
    const q = "DELETE FROM relationship WHERE follower_id = ? AND followed_id = ?";
    const { followed_id } = req.params;
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json({error: "Unauthorized user"}) }

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({error: "Invalid token"}) }

        db.query(q, [userInfo.id, followed_id], (err, data) => {
            if (err) { return res.status(500).json({error: err}) }
            
            res.status(200).json("You have disconnect with this user successfully");
        });
    });
};

//Fetch All Connections
export const Connections = (req, res) => {
    const q = "SELECT u.* FROM users u WHERE u.id IN (SELECT r.followed_id FROM relationship r WHERE r.follower_id = ?)";
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json({ error: "Unauthorized user" }) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({ error: "Invalid token" }) };

        db.query(q, [userInfo.id], (err, data) => {
            if (err) { return res.status(500).json({ error: err }) };

            res.status(200).json(data);
        })
    });
};

//Fetch All Data From Relationship Table
export const relationship = (req, res) => {
    const q = "SELECT * FROM relationship WHERE follower_id = ?";
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json({ error: "Unauthorized user" }) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({ error: "Invalid token" }) }

        db.query(q, [userInfo.id], (err, data) => {
            if (err) { return res.status(500).json({ error: err }) };
            res.status(200).json(data);
        });
    });
};