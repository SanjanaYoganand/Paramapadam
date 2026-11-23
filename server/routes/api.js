const express = require("express");
const router = express.Router();

const gameRoutes = require("./game");
router.use("/game", gameRoutes);

module.exports = router;
