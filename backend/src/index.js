import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "dns";
import cookieParser from "cookie-parser";

import { router as userRouter } from "./routes/userRoutes.js";
import { propertyRouter } from "./routes/propertyRouter.js";
import { bookingRouter } from "./routes/bookingRouter.js";
import { tripRouter } from "./routes/tripRouter.js";
import connectDB from "./utils/db.js";

dotenv.config();

// Use Google's DNS for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8"]);

const app = express();


// =========================
// Middleware
// =========================

app.use(express.json({ limit: "100mb" }));

app.use(
    express.urlencoded({
        limit: "100mb",
        extended: true
    })
);

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.ORIGIN_ACCESS_URL,
        credentials: true
    })
);


// =========================
// Routes
// =========================

// User routes
app.use("/api/v1/rent/user", userRouter);
app.use("/api/v1/rent/listing", propertyRouter);
app.use("/api/v1/rent/booking", bookingRouter);
app.use("/api/v1/rent/ai", tripRouter);


// =========================
// Test Route
// =========================

app.get("/", (req, res) => {
    res.send("HomelyHub server is running");
});


// =========================
// MongoDB Connection
// =========================

connectDB();


// =========================
// Start Server
// =========================

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App is running on port no :${port}`);
});