import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';

// Fetch All Users
export const Users = (req, res) => {
    const q = "SELECT u.* FROM users u WHERE u.id != $1  AND u.id NOT IN (SELECT followed_id FROM relationship r WHERE follower_id = $2 )";
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json({ error: "Unauthorized user" }) }

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({ error: "Invalid token" }) }

        db.query(q, [userInfo.id, userInfo.id], (err, result) => {
            if (err) { return res.status(500).json({ error: err }) }
            res.status(200).json(result.rows);
        })
    })
};