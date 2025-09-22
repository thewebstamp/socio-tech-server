import db from "../lib/dbConnection.js";
import jwt from "jsonwebtoken";


//Change Cover Photo
export const editCover = (req, res) => {
    const q = "UPDATE users SET cover_photo = ? WHERE id = ?";
    const token = req.cookies.accessToken;
    const image = req.files[0].filename;

    if (!token) { return res.status(401).json({error: "Unauthorized user"}) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({error: "Invalid token"}) };

        db.query(q, [image, userInfo.id], (err, data) => {
            if (err) { return res.status(500).json({error: err}) };

            res.status(200).json(image);
        });
    });
};

//Change Profile Picture
export const editProfilePicture = (req, res) => {
    const q = "UPDATE users SET profile_picture = ? WHERE id = ?";
    const token = req.cookies.accessToken;
    const image = req.files[0].filename;
    
    if (!token) { return res.status(401).json({error: "Unauthorized user"}) };

    jwt.verify(token, "secretKey", (error, userInfo) => {
        if (error) { return res.status(403).json({error: "Invalid token"}) }

        db.query(q, [image, userInfo.id], (err, data) => {
            if (err) { return res.status(500).json({error: err}) };

            res.status(200).json(image);
        });
    });
};