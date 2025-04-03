const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 's3cR3tK3y!@#2023$%^&*()_+1234567890';

app.use(cors());
app.use(bodyParser.json());

let users = [];

// Регистрация
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const userExists = users.find(user => user.username === username);
    
    if (userExists) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
});

// Авторизация
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.sendStatus(403);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Это защищенные данные', user: req.user });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
