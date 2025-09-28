import db from "../lib/dbConnection.js";
import jwt from "jsonwebtoken";
import fs from 'fs';
import cloudinary from "../lib/cloudinary.js";


//Change Cover Photo
export const editCover = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "Unauthorized user" });
    if (!req.files || !req.files[0]) return res.status(400).json({ error: "No file uploaded" });

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) return res.status(403).json({ error: "Invalid token" });

        const localPath = req.files[0].path;
        cloudinary.uploader.upload(localPath, { folder: "socio-tech/covers" }, (err, result) => {
            // delete local file
            fs.unlink(localPath, () => { });
            if (err) return res.status(500).json({ error: err });

            const imageUrl = result.secure_url;
            const q = "UPDATE users SET cover_photo = $1 WHERE id = $2";
            db.query(q, [imageUrl, userInfo.id], (err2) => {
                if (err2) return res.status(500).json({ error: err2 });
                res.status(200).json(imageUrl); // return new URL so frontend can update immediately
            });
        });
    });
};

//Change Profile Picture
export const editProfilePicture = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "Unauthorized user" });
    if (!req.files || !req.files[0]) return res.status(400).json({ error: "No file uploaded" });

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) return res.status(403).json({ error: "Invalid token" });

        const localPath = req.files[0].path;
        cloudinary.uploader.upload(localPath, { folder: "socio-tech/profiles" }, (err, result) => {
            fs.unlink(localPath, () => { }); // always remove local file

            if (err) return res.status(500).json({ error: err });

            const imageUrl = result.secure_url;
            const q = "UPDATE users SET profile_picture = $1 WHERE id = $2";
            db.query(q, [imageUrl, userInfo.id], (dbErr) => {
                if (dbErr) return res.status(500).json({ error: dbErr });
                res.status(200).json(imageUrl); // return URL so frontend can update
            });
        });
    });
};