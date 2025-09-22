import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';

// Make Comment Controller
export const createComment = (req, res) => {
    const q = "INSERT INTO comments (content, comment_user_id, created_at, post_id) VALUES (?, ?, NOW(), ?)";
    const token = req.cookies.accessToken;
    const { content, post_id } = req.body;

    if (!token) { return res.status(401).json({error: "Unauthorized user"}) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({error: "Invalid token"}) };

        db.query(q, [content, userInfo.id, post_id], (err, data) => {
            if (err) { res.status(500).json({error: err}) }
            res.status(200).json("Comment made successfully");
        })
    });
};

//Fetch Comment Controller
export const fetchComment = (req, res) => {
    const q = "SELECT c.*, c.id AS commentId, u.id AS userId, u.profile_picture, u.name FROM comments c JOIN users u ON c.comment_user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at DESC";
    const { postId } = req.params;
    
    db.query(q, [postId], (err, data) => {
        if (err) { res.status(500).json({error: err}) };
        res.status(200).json(data);
    })
};