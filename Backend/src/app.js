const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const patentRoutes = require("./routes/patent.routes");
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const app = express();
const corsOrigin = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
    : true;

app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", patentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
module.exports = app;
