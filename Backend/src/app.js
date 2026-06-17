const express = require("express");
const cors = require("cors");
const patentRoutes = require("./routes/patent.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", patentRoutes);

module.exports = app;