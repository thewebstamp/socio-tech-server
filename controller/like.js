import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';

// Like Post Controller
export const Like = (req, res) => {
    const token = req.cookies.accessToken;
    const { like_post_id } = req.body;

    if (!token) return res.status(401).json({ error: "Unauthorized user" });

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) return res.status(403).json({ error: "Invalid token" });

        const checkQ = "SELECT * FROM likes WHERE like_user_id = $1 AND like_post_id = $2";
        db.query(checkQ, [userInfo.id, like_post_id], (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.rows.length > 0) {
                // Already liked → unlike instead
                const deleteQ = "DELETE FROM likes WHERE like_user_id = $1 AND like_post_id = $2";
                db.query(deleteQ, [userInfo.id, like_post_id], (err) => {
                    if (err) return res.status(500).json({ error: err });
                    res.status(200).json({ message: "Post unliked" });
                });
            } else {
                // Not liked → insert
                const insertQ = "INSERT INTO likes (like_user_id, like_post_id) VALUES ($1, $2)";
                db.query(insertQ, [userInfo.id, like_post_id], (err) => {
                    if (err) return res.status(500).json({ error: err });
                    res.status(200).json({ message: "Post liked" });
                });
            }
        });
    });
};

//Unlike a Post
export const unLike = (req, res) => {
    const q = "DELETE FROM likes WHERE like_user_id = $1 AND like_post_id = $2";
    const token = req.cookies.accessToken;
    const { postId } = req.params;

    if (!token) { return res.status(401).json({ error: "Unauthorized user" }) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({ error: "Invalid token" }) };

        db.query(q, [userInfo.id, postId], (err, result) => {
            if (err) { return res.status(500).json({ error: err }) };

            res.status(200).json("Post was unliked successfully");
        });
    });
};

//Fetch Users That Like a Post
export const checkLiked = (req, res) => {
    const q = "SELECT * FROM likes WHERE like_post_id = $1";
    const { postId } = req.params;

    db.query(q, [postId], (err, result) => {
        if (err) { return res.status(500).json({ error: err }) }

        res.status(200).json(result.rows);
    });
};