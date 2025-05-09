import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";

const app = express();
const port = 3000;

// MongoDB Connection
const URL = "mongodb://127.0.0.1:27017/TEST2";
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error("MongoDB connection error:", err));

app.set('view engine', 'ejs');

// Middleware for parsing incoming request bodies
app.use(express.urlencoded({ extended: true })); // Replaces bodyParser
app.use(express.json()); // If you need to handle JSON requests
app.use(express.static('public')); // Serve static files from 'public' folder

// MongoDB Schema and Model
const dataSchema = new mongoose.Schema({
  name: String,
  comment: String,
  Game: String,
});

const DataModel = mongoose.model('Data', dataSchema);

// List of allowed games
const games = [
  'Eldenring',
  'FC24',
  'GodOfWar',
  'Minecraft',
  'TheForest',
  'TheLastOfUs'
];

// Default Route (Homepage)
app.get('/', (req, res) => {
  res.render('index');
});

// Dynamic GET route for each game
app.get('/:game.ejs', async (req, res) => {
  const game = req.params.game;

  if (!games.includes(game)) {
    return res.status(404).send("Game not found");
  }

  try {
    const data = await DataModel.find({ Game: game });
    res.render(game, { data, game });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Add Comment Route (POST)
app.post('/addComment/:game', async (req, res) => {
  const game = req.params.game;

  // Check if game is valid
  if (!games.includes(game)) {
    return res.status(400).send("Invalid game");
  }

  const { name, comment } = req.body;

  try {
    const newComment = new DataModel({ name, comment, Game: game });
    await newComment.save();
    res.redirect(`/${game}.ejs`);
  } catch (err) {
    res.status(500).send("Failed to add comment: " + err.message);
  }
});

// Edit Comment Route (POST)
app.post('/editComment', async (req, res) => {
  const { id, comment } = req.body;

  try {
    const updatedComment = await DataModel.findByIdAndUpdate(id, { comment }, { new: true });
    if (!updatedComment) {
      return res.status(404).send("Comment not found");
    }
    res.redirect(`/${updatedComment.Game}.ejs`);
  } catch (err) {
    res.status(500).send("Failed to update comment: " + err.message);
  }
});

// Delete Comment Route (POST)
app.post('/deleteComment/:id/:game', async (req, res) => {
  const { id, game } = req.params;

  // Check if game is valid
  if (!games.includes(game)) {
    return res.status(400).send("Invalid game");
  }

  try {
    const deletedComment = await DataModel.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).send("Comment not found");
    }
    res.send({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).send("Failed to delete comment: " + err.message);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
