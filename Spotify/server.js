const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
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


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// login
app.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.userId = results[0].UserID;
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
    const options = req.body.options;

    if (username && password && email && birthday && address) {
        db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                return res.redirect('/?error=alreadyexistsuser');
            } else {
                db.query('INSERT INTO users (username, password, email, birthday, address) VALUES (?, ?, ?, ?, ?)',
                    [username, password, email, birthday, address], (err, results) => {
                        if (err) throw err;
                        req.session.loggedin = true;
                        req.session.username = username;
                        const userId = results.insertId;

                        if (options === "singer") {
                            db.query('INSERT INTO artist (ArtistID, name) VALUES (?,?)',
                                [userId, username], (err, results) => {
                                    if (err) throw err;
                                    res.redirect('/home');
                                });
                        } else {
                            res.redirect('/home');
                        }
                    });
            }
        });
    }
});


// login

// home

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        const username = req.session.username;

        db.query('SELECT * FROM users WHERE username = ?', [username], (err, userResults) => {
            if (err) throw err;
            if (userResults.length > 0) {
                const userId = userResults[0].UserID;
                const isPremium = userResults[0].is_premium;

                db.query('SELECT * FROM artist WHERE ArtistID = ?', [userId], (err, artistResults) => {
                    if (err) throw err;

                    let userType = 'normal';
                    if (artistResults.length > 0) {
                        userType = 'artist';
                    } else if (isPremium) {
                        userType = 'premium';
                    }

                    res.sendFile(path.join(__dirname, 'public', 'home.html'));
                    req.session.userType = userType;
                });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

app.get('/getUserType', (req, res) => {
    if (req.session.loggedin) {
        res.json({ userType: req.session.userType });
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
});

// home

// wallet

app.get('/wallet', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'wallet.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getWalletBalance', (req, res) => {
    if (req.session.loggedin) {
        const username = req.session.username;

        db.query('SELECT wallet FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.json({ wallet: results[0].wallet });
            } else {
                res.json({ wallet: 0 });
            }
        });
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
});

app.post('/wallet/add', (req, res) => {
    if (req.session.loggedin) {
        const username = req.session.username;
        const amount = parseFloat(req.body.amount);

        db.query('UPDATE Users SET wallet = wallet + ? WHERE username = ?', [amount, username], (err, results) => {
            if (err) throw err;
            db.query('SELECT wallet FROM Users WHERE username = ?', [username], (err, results) => {
                if (err) throw err;
                res.json({ wallet: results[0].wallet, message: 'Money added successfully.' });
            });
        });
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
});

app.post('/wallet/take', (req, res) => {
    if (req.session.loggedin) {
        const username = req.session.username;
        const amount = parseFloat(req.body.amount);

        db.query('SELECT wallet FROM Users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            if (results[0].wallet < amount) {
                res.json({ error: 'Insufficient funds in wallet.' });
            } else {
                db.query('UPDATE Users SET wallet = wallet - ? WHERE username = ?', [amount, username], (err, results) => {
                    if (err) throw err;
                    db.query('SELECT wallet FROM Users WHERE username = ?', [username], (err, results) => {
                        if (err) throw err;
                        res.json({ wallet: results[0].wallet, message: 'Money taken successfully.' });
                    });
                });
            }
        });
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
});


// wallet

// buy premium account

app.get('/BuyPremiumAccount', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'buypremium.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/addToPremium', (req, res) => {
    if (req.session.loggedin) {
        const username = req.session.username;

        db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                const userId = results[0].UserID;

                db.query('INSERT INTO PremiumUsers (PremiumID) VALUES (?)', [userId], (err, results) => {
                    if (err) throw err;

                    db.query('UPDATE Users SET is_premium = 1 WHERE UserID = ?', [userId], (err, results) => {
                        if (err) throw err;
                        res.redirect('/');
                    });
                });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});



// buy premium account


// add song
app.get('/AddSong', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'addsong.html'));
    } else {
        res.redirect('/');
    }
});

app.post('/addSong', upload.single('audio_file'), (req, res) => {
    const { name, album, genre, country, age, lyric, is_limited } = req.body;
    const isLimitedAsInt = is_limited ? 1 : 0;

    const audio_file = req.file.buffer;

    db.query('SELECT * FROM users WHERE username = ?', [req.session.username], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user information');
        }
        if (userResults.length > 0) {
            const artistId = userResults[0].UserID;

            const query = 'INSERT INTO Songs (name, ArtistID, genre, country, age, lyric, is_limited, audio_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(query, [name, artistId, genre, country, age, lyric, isLimitedAsInt, audio_file], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error adding song');
                }
                res.send('Song added successfully');
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});


app.get('/getSongs', (req, res) => {
    if (req.session.loggedin) {
        db.query('SELECT * FROM users WHERE username = ?', [req.session.username], (err, userResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving user information');
            }
            if (userResults.length > 0) {
                const artistId = userResults[0].UserID;

                const query = 'SELECT * FROM Songs WHERE ArtistID = ?';
                db.query(query, [artistId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error fetching songs');
                    }
                    const songs = results.map(row => ({
                        name: row.name,
                        audio_file: row.audio_file.toString('base64')
                    }));
                    res.json(songs);
                });
            } else {
                res.status(404).send('User not found');
            }
        });

    } else {
        res.status(401).send('User not logged in');
    }
});

//add song

// follwers

app.get('/Followers', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'Followers.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getNonFollowers', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT * FROM Users WHERE UserID NOT IN (
                SELECT FollowerID FROM Followers WHERE PremiumID = ?
            ) AND UserID != ? AND is_premium = true
        `;
        db.query(query, [userId, userId], (err, results) => {
            if (err) throw err;
            res.json({ nonFollowers: results });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/followUser/:id', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const followUserId = req.params.id;
        const query = `INSERT INTO Followers (PremiumID, FollowerID) VALUES (?, ?)`;

        db.query(query, [userId, followUserId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});

app.post('/unfollowUser/:id', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const unfollowUserId = req.params.id;
        const query = `DELETE FROM Followers WHERE PremiumID = ? AND FollowerID = ?`;

        db.query(query, [userId, unfollowUserId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});

app.get('/getFollowers', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT U.UserID, U.username FROM Followers F
            JOIN Users U ON F.FollowerID = U.UserID
            WHERE F.PremiumID = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            res.json({ followers: results });
        });
    } else {
        res.redirect('/');
    }
});


// followers


// favorite songs

app.get('/FavoriteSong', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'favsong.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getNonFavSongs', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT * FROM Songs WHERE SongID NOT IN (
                SELECT SID FROM Favorite_Song WHERE PrID = ?
            ) 
        `;
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            res.json({ nonFavSongs: results });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/favUserSong/:id', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const songId = req.params.id;
        const query = `INSERT INTO Favorite_Song (PrID, SID) VALUES (?, ?)`;

        db.query(query, [userId, songId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});


app.get('/getAllSongs', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT S.SongID, S.name FROM Songs S
            JOIN Favorite_Song F ON F.SID = S.SongID
            WHERE F.PrID = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            res.json({ allSongs: results });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/notFavUserSong/:id', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const songId = req.params.id;
        const query = `DELETE FROM Favorite_Song WHERE PrID = ? AND SID = ?`;

        db.query(query, [userId, songId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});

// favorite songs

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});