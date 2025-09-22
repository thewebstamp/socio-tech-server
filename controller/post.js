import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';

//FETCH POSTS IN HOMEPAGE CONTROLLER
export const getPosts = (req, res) => {
    const q = "SELECT p.*, p.id AS postId, u.id AS userId, u.profile_picture, u.name, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count FROM post p JOIN users u ON p.user_id = u.id LEFT JOIN relationship r ON r.followed_id = u.id WHERE r.follower_id = ? OR u.id = ? ORDER BY p.created_at DESC;";
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json("Unauthorized token") };

    jwt.verify(token, "secretKey", (err, userInfo) => {
        if (err) { return res.status(403).json("Invalid token") };

        db.query(q, [userInfo.id, userInfo.id], (err, data) => {
            if (err) { return res.status(500).json({error: err}) }
            res.status(200).json(data);
        })
    })
};

//FETCH POST IN PROFILE PAGE
export const fetchUserPost = (req, res) => {
    const q = "SELECT p.*, p.id AS postId, u.id AS userId, u.profile_picture, u.name, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count FROM post p JOIN users u ON p.user_id = u.id WHERE u.id = ? ORDER BY p.created_at DESC";
    const { id } = req.params
        db.query(q, [id], (err, data) => {
            if (err) { return res.status(500).json({error: err}) }
            res.status(200).json(data);
        });
};

// FETCH USER DETAILS FOR PROFILE
export const userProfile =  (req, res) => {
  const q = "SELECT id, name, username, profile_picture, cover_photo, (SELECT COUNT(*) FROM relationship r WHERE r.follower_id = u.id) AS connections FROM users u WHERE u.id = ?";
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(data[0]);
  });
};

//CREATE POST
export const createPost = (req, res) => {
    const { content } = req.body;
    const files = req.files.map((file) => file.filename);

    const [image1, image2, image3, image4] = [
        files[0] || null,
        files[1] || null,
        files[2] || null,
        files[3] || null,
    ];

    const q = "INSERT INTO post (user_id, content, image1, image2, image3, image4, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    const token = req.cookies.accessToken;
    if (!token) { return res.status(401).json({error: "You are not authorized to make this post"}) }

    jwt.verify(token, "secretKey", (err, userInfo) => {
        if (err) { return res.status(403).json({error: "Invalid token"}) }

        db.query(q, [userInfo.id, content, image1, image2, image3, image4], (err, data) => {
            if (err) { return res.status(500).json({error: err}) }
            return res.status(200).json("Post was made successfully")
        })
    })
};