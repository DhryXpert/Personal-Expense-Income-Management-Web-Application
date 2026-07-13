const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, syncTransactions } = require("../controllers/chatController");

router.post("/message", protect, sendMessage);
router.post("/sync", protect, syncTransactions);

module.exports = router;
