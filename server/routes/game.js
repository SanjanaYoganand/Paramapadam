const express = require("express");
const router = express.Router();

const BOARD_SIZE = 132;
const board = Array.from({ length: BOARD_SIZE }, (_, i) => ({
  numb: i + 1,
  snld: "none",
  to: i + 1,
}));

// Snakes
[
  [111, 89], [113, 109], [119, 95], [121, 99], [106, 1],
  [97, 73], [75, 10], [59, 8], [47, 25], [55, 34],
  [43, 21], [26, 3], [17, 6]
].forEach(([from, to]) => {
  board[from - 1].to = to;
  board[from - 1].snld = "snake";
});

// Ladders
[
  [16, 28], [19, 39], [30, 50], [41, 61], [52, 72],
  [63, 83], [65, 105], [74, 94], [79, 117], [81, 115],
  [87, 115]
].forEach(([from, to]) => {
  board[from - 1].to = to;
  board[from - 1].snld = "ladder";
});

let P1pos = 0;
let P2pos = 0;
let turn = 1;
let gameOver = false;

router.post("/dice-roll", (req, res) => {
  if (gameOver) {
    return res.status(400).json({ error: "Game is over!" });
  }
  const roll = Math.floor(Math.random() * 6) + 1;
  res.json({ value: roll });
});

router.post("/move", (req, res) => {
  console.log("Received move request:", req.body);
  if (gameOver) {
    return res.status(400).json({ error: "Game is over!" });
  }

  const { player, dice } = req.body;

  if (player !== turn) {
    return res.status(400).json({ error: "Not your turn!" });
  }

  let currentPos = player === 1 ? P1pos : P2pos;
  let landedPos = currentPos + dice;
  let finalPos = landedPos;
  let snld = "none";

  if (landedPos > BOARD_SIZE) {
    landedPos = currentPos; // stay in place if overshoot
    finalPos = landedPos;
  } else {
    const square = board[landedPos - 1];
    snld = square.snld;
    if (snld !== "none") {
      finalPos = square.to;
    }
  }

  if (player === 1) {
    P1pos = finalPos;
    if (P1pos === BOARD_SIZE) {
      gameOver = true;
      return res.json({ P1pos, P2pos, turn: null, winner: 1, landedPos, finalPos, snld });
    }
    turn = 2;
  } else {
    P2pos = finalPos;
    if (P2pos === BOARD_SIZE) {
      gameOver = true;
      return res.json({ P1pos, P2pos, turn: null, winner: 2, landedPos, finalPos, snld });
    }
    turn = 1;
  }

  res.json({ P1pos, P2pos, turn, winner: null, landedPos, finalPos, snld });
});




module.exports = router;
