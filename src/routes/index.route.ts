import express, { Router } from "express";

const router: Router = express.Router();

import authRoute from "./auth.route.js";

router.use("/auth", authRoute);

export default router;