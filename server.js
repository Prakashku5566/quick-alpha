const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // Change this to the desired port number

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const User = mongoose.model('User', {
  name: String,
  number: String,
  email: String,
  password: String,
  is_premium_user: Boolean,
});

const Article = mongoose.model('Article', {
  title: String,
  content: String,
  is_premium: Boolean,
});

const Comment = mongoose.model('Comment', {
  article_reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  user_reference: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: String,
});

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/signup', async (req, res) => {
  try {
    const { name, number, email, password } = req.body;
    const user = new User({ name, number, email, password, is_premium_user: false });
    await user.save();
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { numberOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ number: numberOrEmail }, { email: numberOrEmail }],
      password,
    });
    if (user) {
      res.status(200).json({ message: 'Login successful.', user });
    } else {
      res.status(401).json({ error: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.get('/getAllArticles', async (req, res) => {
  try {
    const articles = await Article.find({ is_premium: false });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Protected routes (require authentication)
// Implement authentication middleware to check if the user is logged in before proceeding

app.post('/comment', async (req, res) => {
  // Authentication middleware goes here
  try {
    const { article_reference, user_reference, comment } = req.body;
    const commentData = new Comment({ article_reference, user_reference, comment });
    await commentData.save();
    res.status(201).json({ message: 'Comment added successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.post('/goPremium', async (req, res) => {
  // Authentication middleware goes here
  try {
    // Find the user and update is_premium_user to true
    const user = await User.findByIdAndUpdate(req.body.user_reference, { is_premium_user: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User upgraded to premium successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
