import db from "../lib/dbConnection.js";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import cloudinary from "../lib/cloudinary.js";

//FETCH POSTS IN HOMEPAGE CONTROLLER
export const getPosts = (req, res) => {
    const q = "SELECT p.*, p.id AS postId, u.id AS userId, u.profile_picture, u.name, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count FROM post p JOIN users u ON p.user_id = u.id LEFT JOIN relationship r ON r.followed_id = u.id WHERE r.follower_id = $1 OR u.id = $2 ORDER BY p.created_at DESC;";
    const token = req.cookies.accessToken;

    if (!token) { return res.status(401).json("Unauthorized token") };

    jwt.verify(token, "secretKey", (err, userInfo) => {
        if (err) { return res.status(403).json("Invalid token") };

        db.query(q, [userInfo.id, userInfo.id], (err, result) => {
            if (err) { return res.status(500).json({ error: err }) }
            res.status(200).json(result.rows);
        })
    })
};

//FETCH POST IN PROFILE PAGE
export const fetchUserPost = (req, res) => {
    const q = "SELECT p.*, p.id AS postId, u.id AS userId, u.profile_picture, u.name, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count FROM post p JOIN users u ON p.user_id = u.id WHERE u.id = $1 ORDER BY p.created_at DESC";
    const { id } = req.params
    db.query(q, [id], (err, result) => {
        if (err) { return res.status(500).json({ error: err }) }
        res.status(200).json(result.rows);
    });
};

// FETCH USER DETAILS FOR PROFILE
export const userProfile = (req, res) => {
    const q = "SELECT id, name, username, profile_picture, cover_photo, (SELECT COUNT(*) FROM relationship r WHERE r.follower_id = u.id) AS connections FROM users u WHERE u.id = $1";
    db.query(q, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(result.rows[0]);
    });
};

//CREATE POST
export const createPost = (req, res) => {
    const token = req.cookies.accessToken;
    const { content } = req.body;
    if (!token) return res.status(401).json({ error: "You are not authorized to make this post" });

    jwt.verify(token, "secretKey", (err, userInfo) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        const files = req.files || [];
        // upload all files to Cloudinary (Promise.all), then insert row
        const uploadPromises = files.map(file =>
            cloudinary.uploader.upload(file.path, { folder: "socio-tech/posts" })
                .then(result => {
                    // delete local temp file
                    try { fs.unlinkSync(file.path); } catch (e) { }
                    return result.secure_url;
                })
        );

        Promise.all(uploadPromises)
            .then(urls => {
                const [image1 = null, image2 = null, image3 = null, image4 = null] = urls;
                const q = "INSERT INTO post (user_id, content, image1, image2, image3, image4, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())";
                db.query(q, [userInfo.id, content, image1, image2, image3, image4], (err2, result2) => {
                    if (err2) return res.status(500).json({ error: err2 });
                    res.status(200).json("Post was made successfully");
                });
            })
            .catch(uploadErr => {
                // cleanup any temp files if needed
                files.forEach(f => { try { fs.unlinkSync(f.path); } catch (e) { } });
                res.status(500).json({ error: uploadErr });
            });
    });
};