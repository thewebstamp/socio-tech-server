import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';

// Like Post Controller
export const Like = (req, res) => {
    const q = "INSERT INTO likes (liked, like_user_id, like_post_id) VALUES (?, ?, ?)";
    const token = req.cookies.accessToken;
    const {liked, like_post_id } = req.body;

    if (!token) { return res.status(401).json({error: "Unauthorized user"}) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({error: "Invalid token"}) };

        db.query(q, [liked, userInfo.id, like_post_id], (err, data) => {
            if (err) { return res.status(500).json({error: err}) }
            res.status(200).json("User successfully liked post");
        });
    })
};

//Unlike a Post
export const unLike = (req, res) => {
    const q = "DELETE FROM likes WHERE like_user_id = ? AND like_post_id = ?";
    const token = req.cookies.accessToken;
    const { postId } = req.params;

    if (!token) { return res.status(401).json({error: "Unauthorized user"}) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { res.status(403).json({error: "Invalid token"}) };

        db.query(q, [userInfo.id, postId], (err, data) => {
            if (err) { res.status(500).json({error: err}) };
            
            res.status(200).json("Post was unliked successfully");
        });
    });
};

//Fetch Users That Like a Post
export const checkLiked = (req, res) => {
    const q = "SELECT * FROM likes WHERE like_post_id = ?";
    const { postId } = req.params;

    db.query(q, [postId], (err, data) => {
        if (err) { return res.status(500).json({error: err}) }

        res.status(200).json(data);
    });
};