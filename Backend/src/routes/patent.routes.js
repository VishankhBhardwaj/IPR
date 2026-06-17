const express = require("express");
const patentController = require("../controllers/patent.controller");
const router = express.Router();

router.get("/patents", patentController.getAllPatents);
router.get("/patents/:id", patentController.getPatentById);
router.post("/patents", patentController.addPatent);
router.delete("/patents/:id", patentController.deletePatent);
module.exports = router;