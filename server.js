const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, BMI } = require('./config/database');
const app = express();
const port = 3000;

const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/bmi', authenticateJWT, async (req, res) => {
  try {
    const { weight, height, bmi, category } = req.body;
    const bmiEntry = await BMI.create({ weight, height, bmi, category, userId: req.user.userId });
    res.status(201).json(bmiEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/bmi', authenticateJWT, async (req, res) => {
  try {
    const bmiEntries = await BMI.findAll({ where: { userId: req.user.userId } });
    res.status(200).json(bmiEntries);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bmi/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, height, bmi, category } = req.body;
    const bmiEntry = await BMI.findOne({ where: { id, userId: req.user.userId } });

    if (!bmiEntry) {
      return res.status(404).json({ message: 'BMI entry not found' });
    }

    bmiEntry.weight = weight;
    bmiEntry.height = height;
    bmiEntry.bmi = bmi;
    bmiEntry.category = category;
    await bmiEntry.save();

    res.json(bmiEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/bmi/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const bmiEntry = await BMI.findOne({ where: { id, userId: req.user.userId } });

    if (!bmiEntry) {
      return res.status(404).json({ message: 'BMI entry not found' });
    }

    await bmiEntry.destroy();
    res.json({ message: 'BMI entry deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
