import express from 'express';
import cors from 'cors';
import authRoute from './route/authRoute.js';
import postRoute from './route/postRoute.js';
import CreatePost from './route/createPost.js';
import Status from './route/status.js';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import db from './lib/dbConnection.js';
import commentRoute from './route/commentRoute.js';
import Like from './route/likeRoute.js';
import Users from './route/usersRoute.js';
import Connect from './route/connection.js';
import Edit from './route/editRoute.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 1800;
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
})
app.use(express.json());
app.use(cors({
    origin: "https://sociotech.netlify.app",
    credentials: true
}));
app.use(cookieParser());

// Serve uploaded images
// app.use("/uploads", express.static("uploads"));
//Express Router
app.use("/api/auth", authRoute); // User Authentication Route
app.use("/api", postRoute); // Route to Fetch Posts in Home Page
app.use("/api", CreatePost); // Create Post
app.use("/api", Status); // Fetch Status & Status Upload
app.use("/api", commentRoute); // Make Comment & Fetch Comment
app.use("/api", Like); // Like and Unlike a Post
app.use("/api", Users); //Fetch All Users
app.use("/api", Connect); //Connect with a User
app.use("/api", Edit); // Edit Cover & Profile Picture

cron.schedule("0 * * * *", () => {
    const q = "DELETE FROM status WHERE created_at < NOW() - INTERVAL '24 HOURS'";
    db.query(q, (err, result) => {
        if (err) {
            console.error("❌ Error cleaning statuses:", err);
        } else {
            console.log("✅ Old statuses cleaned up:", result.rowCount, "deleted");
        }
    });
});

app.listen(PORT, () => {
    console.log(`server running at port ${PORT}`)
});