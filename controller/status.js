import jwt from 'jsonwebtoken';
import db from '../lib/dbConnection.js';

//FETCH STATUS
export const fetchStatus = (req, res) => {
    const q = "SELECT s.*, s.id AS statusId, u.name, u.profile_picture, u.id AS userId FROM status s JOIN users u ON s.status_user_id = u.id LEFT JOIN relationship r ON r.followed_id = u.id WHERE r.follower_id = $1 OR u.id = $2 ORDER BY s.created_at DESC";
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json({ error: "Unauthorised user" }) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({ error: "Invalid user token" }) };

        db.query(q, [userInfo.id, userInfo.id], (err, result) => {
            if (err) { return res.status(500).json({ error: err }) }
            res.status(200).json(result.rows);
        });
    });
};

//UPLOAD STATUS
export const Status = (req, res) => {
    const q = "INSERT INTO status (image, created_at, status_user_id) VALUES ($1, NOW(), $2)";
    const image = req.files[0].filename;
    const token = req.cookies.accessToken;

    if (!req.files || !req.files[0]) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    if (!token) { return res.status(401).json({ error: "Unauthorized to make a status" }) }

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(401).json({ error: "Invalid Token" }) }

        db.query(q, [image, userInfo.id], (err, result) => {
            if (err) { return res.status(500).json({ error: err }) };
            res.status(200).json("Status was uploaded successful")
        })
    });
};