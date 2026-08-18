const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth");

router.post("/ask-database", authMiddleware, aiController.askDatabaseController);

module.exports = router;
