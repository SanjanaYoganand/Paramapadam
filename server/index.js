const express = require('express');
const cors = require('cors');
const gameRouter = require('./routes/game');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRouter);  // Mount game.js router here

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
