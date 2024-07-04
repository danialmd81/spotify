const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { log } = require('console');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sobhanAGH5897',
    database: 'spotify'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/js', express.static(path.join(__dirname, 'js')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/home');
            } else {
                res.redirect('/?error=nouser');
            }
        });
    }
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const birthday = req.body.birthday;
    const address = req.body.address;

    if (username && password && email && birthday && address) {
        db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.redirect('/?error=alreadyexistsuser');
            } else {
                db.query('INSERT INTO users (username, password, email, birthday, address) VALUES (?, ?, ?, ?, ?)',
                    [username, password, email, birthday, address], (err, results) => {
                        if (err) throw err;
                        req.session.loggedin = true;
                        req.session.username = username;
                        res.redirect('/home');
                    });
            }
        });
    }
});

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});