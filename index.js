import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";

const app = express();
const port = 3000;

const URL = "mongodb://127.0.0.1:27017/TEST2";
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error("MongoDB connection error:", err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(express.static('public')); 

const dataSchema = new mongoose.Schema({
  name: String,
  comment: String,
  Game: String,
});

const DataModel = mongoose.model('Data', dataSchema);

const games = [
  'Eldenring',
  'FC24',
  'GodOfWar',
  'Minecraft',
  'TheForest',
  'TheLastOfUs'
];

app.get('/', (req, res) => {
  res.render('index');
});

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

app.post('/addComment/:game', async (req, res) => {
  const game = req.params.game;
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

app.post('/deleteComment/:id/:game', async (req, res) => {
  const { id, game } = req.params;
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
