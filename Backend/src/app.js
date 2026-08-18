const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const patentRoutes = require("./routes/patent.routes");
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const app = express();
const corsOrigin = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
    : process.env.NODE_ENV === "production" ? [] : true;

app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api", patentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && "body" in error) {
        return res.status(400).json({ success: false, message: "Invalid JSON request body" });
    }
    console.error("Unhandled request error:", error);
    return res.status(error.status || 500).json({ success: false, message: "Internal server error" });
});
module.exports = app;
