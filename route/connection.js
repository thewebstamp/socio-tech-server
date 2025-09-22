import express from 'express';
import { Connect, Connections, disconnect, relationship } from '../controller/connection.js';

const router = express.Router();

//Connect With a User
router.post("/connect", Connect);
//Fetch All Connections
router.get("/connections", Connections);
//Fetch Relationship Table Data
router.get("/relationship", relationship);
//Disconnect with a User
router.delete("/disconnect/:followed_id", disconnect);

export default router;