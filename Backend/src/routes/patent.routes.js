const express = require("express");
const patentController = require("../controllers/patent.controller");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
router.get("/patents", authMiddleware, patentController.getAllPatents);
router.get("/patents/:id", authMiddleware, patentController.getPatentById);
router.post("/patents", authMiddleware, patentController.addPatent);
router.delete("/patents/:id", authMiddleware, patentController.deletePatent);
module.exports = router;