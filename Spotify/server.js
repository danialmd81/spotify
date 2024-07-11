const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
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
                                });
                            db.query('UPDATE users set is_premium = 1 where UserId = ?',
                                [userId], (err, results) => {
                                    if (err) throw err;
                                });
                            db.query('INSERT INTO PremiumUsers (PremiumID) VALUES (?)',
                                [userId], (err, results) => {
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

//logout
app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

//logout

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
        const duration = req.body.duration;
        req.session.duration = duration;

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
        const duration = req.session.duration;
        console.log(duration);

        db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                const userId = results[0].UserID;

                db.query('INSERT INTO PremiumUsers (PremiumID, Duration) VALUES (?, ?)', [userId, duration], (err, results) => {
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
    const { name, genre, country, age, lyric, is_limited } = req.body;
    let isLimitedAsInt = is_limited === 'true' ? 1 : 0;
    const audio_file = req.file.buffer;

    db.query('SELECT * FROM users WHERE username = ?', [req.session.username], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user information');
        }
        if (userResults.length > 0) {
            const artistId = userResults[0].UserID;

            db.query('SELECT * FROM Songs WHERE name = ? AND ArtistID = ?', [name, artistId], (err, songResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error checking for song');
                }
                if (songResults.length > 0) {
                    res.send(String(songResults[0].SongID));
                } else {
                    const query = 'INSERT INTO Songs (name, ArtistID, genre, country, age, lyric, is_limited, audio_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                    db.query(query, [name, artistId, genre, country, age, lyric, isLimitedAsInt, audio_file], (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Error adding song');
                        }
                        res.send(String(result.insertId));
                    });
                }
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});



//add song

// delete song
app.get('/DeleteSong', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'deletesong.html'));
    } else {
        res.redirect('/');
    }
});

app.post('/deletesongartist', upload.none(), (req, res) => {
    if (req.session.loggedin) {
        const songname = req.body.name;
        const query = `
            DELETE FROM songs WHERE name = ?
        `;
        db.query(query, [songname], (err, results) => {
            if (err) throw err;
            res.send('Song removed successfully');
        });
    } else {
        res.redirect('/');
    }
});

// delete song

// my songs

app.get('/MySongs', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'mysongs.html'));
    } else {
        res.redirect('/');
    }
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

// my songs


// songs noraml user

app.get('/getAllNormalSongs', (req, res) => {
    if (req.session.userId) {
        const query = 'SELECT * FROM Songs';
        db.query(query, (err, results) => {
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
        res.status(401).send('User not logged in');
    }

});

// songs noraml user

// songs premium user

app.get('/Songs', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = 'SELECT COUNT(*) AS count FROM premiumusers WHERE PremiumID = ?';
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            if (results[0].count > 0) {
                res.sendFile(path.join(__dirname, 'public', 'songs.html'));
            }
            else {
                res.sendFile(path.join(__dirname, 'public', 'songsnormaluser.html'));
            }
        });
    } else {
        res.redirect('/');
    }
});

app.get('/getAllSongs', (req, res) => {
    if (req.session.userId) {
        const query = `
            SELECT 
                s.SongID AS id, s.name AS song_name, s.lyric, 
                TO_BASE64(s.audio_file) AS audio_file, 
                a.name AS artist_name,
                c.Comment AS comment, 
                c.PrID AS commenterId,
                u.username AS commenter_name
            FROM Songs s
            JOIN Artist a ON s.ArtistID = a.ArtistID
            LEFT JOIN Comments c ON s.SongID = c.SID
            LEFT JOIN Users u ON c.PrID = u.UserID
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching songs');
            }

            const songsMap = results.reduce((acc, row) => {
                if (!acc[row.id]) {
                    acc[row.id] = {
                        id: row.id,
                        name: row.song_name,
                        artist_name: row.artist_name,
                        lyric: row.lyric,
                        audio_file: row.audio_file,
                        comments: []
                    };
                }
                if (row.comment) {
                    acc[row.id].comments.push({ commenterId: row.commenterId, commenterName: row.commenter_name, text: row.comment });
                }
                return acc;
            }, {});

            res.json(Object.values(songsMap));
        });
    } else {
        res.status(401).send('User not logged in');
    }
});

app.post('/likeSong', (req, res) => {
    const { songId } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO Likes (PrID, SID) VALUES (?, ?)';
    db.query(sql, [userId, songId], (err, result) => {
        if (err) throw err;
        res.send('Song liked!');
    });
});

app.post('/addToFavorite', (req, res) => {
    const { songId } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO Favorite (PrID, SID) VALUES (?, ?)';
    db.query(sql, [userId, songId], (err, result) => {
        if (err) throw err;
        res.send('Song added to favorites!');
    });
});

app.post('/addComment', (req, res) => {
    const { songId, comment } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO Comments (PrID, SID, Comment) VALUES (?, ?, ?)';
    db.query(sql, [userId, songId, comment], (err, result) => {
        if (err) throw err;
        res.send('Comment added!');
    });
});
// songs premium user

// add song to playlist
app.get('/getUserPlaylists', (req, res) => {
    const query = 'SELECT * FROM Playlists WHERE PremiumID = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/addToPlaylist', (req, res) => {
    const { playlistId, songId } = req.body;

    const checkSongQuery = 'SELECT is_limited FROM Songs WHERE SongID = ?';
    db.query(checkSongQuery, [songId], (err, results) => {
        if (err) throw err;
        if (results.length > 0 && results[0].is_limited) {
            return res.json({ success: false, message: 'This song is forbidden by the artist.' });
        }

        const addToPlaylistQuery = 'INSERT INTO Playlist_Songs (PID, SID) VALUES (?, ?)';
        db.query(addToPlaylistQuery, [playlistId, songId], (err) => {
            if (err) throw err;
            res.json({ success: true });
        });
    });
});

app.post('/createPlaylist', (req, res) => {
    const { name, songId } = req.body;

    const createPlaylistQuery = 'INSERT INTO Playlists (PremiumID, name) VALUES (?, ?)';
    db.query(createPlaylistQuery, [req.session.userId, name], (err, results) => {
        if (err) throw err;

        const playlistId = results.insertId;

        const checkSongQuery = 'SELECT is_limited FROM Songs WHERE SongID = ?';
        db.query(checkSongQuery, [songId], (err, results) => {
            if (err) throw err;

            if (results.length > 0 && results[0].is_limited) {
                return res.json({ success: false, message: 'This song is forbidden by the artist.', playlist: { id: playlistId, name } });
            }

            const addToPlaylistQuery = 'INSERT INTO Playlist_Songs (PID, SID) VALUES (?, ?)';
            db.query(addToPlaylistQuery, [playlistId, songId], (err) => {
                if (err) throw err;
                res.json({ success: true, id: playlistId, name: name });
            });
        });
    });
});


// add song to playlist


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

app.get('/getAllFavSongs', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
                    SELECT Songs.name, Songs.audio_file 
                    FROM Favorite 
                    JOIN Songs ON Favorite.SID = Songs.SongID 
                    WHERE Favorite.PrID = ?`;
        db.query(query, [userId], (err, results) => {
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
        res.status(401).send('User not logged in');
    }
});

app.delete('/deleteSong', (req, res) => {
    if (req.session.loggedin) {
        const songName = req.body.name;

        db.query(`
            DELETE Favorite 
            FROM Favorite 
            JOIN Songs ON Favorite.SID = Songs.SongID 
            WHERE Songs.name = ? AND Favorite.PrID = ?`,
            [songName, req.session.userId], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error deleting song');
                }

                if (result.affectedRows > 0) {
                    res.status(200).send('Song deleted');
                } else {
                    res.status(404).send('Song not found');
                }
            }
        );
    } else {
        res.status(401).send('User not logged in');
    }
});

// favorite songs


// favorite artist
app.get('/Favoriteartist', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'favartist.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getNonFavArtist', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT * FROM Artist WHERE ArtistID NOT IN (
                SELECT ArID FROM Favorite_Artist WHERE PrID = ?
            ) 
        `;
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            res.json({ nonFavArtists: results });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/favUserArtist/:id', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const artistId = req.params.id;
        const query = `INSERT INTO Favorite_Artist (PrID, ArID) VALUES (?, ?)`;

        db.query(query, [userId, artistId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});

app.get('/getAllArtists', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT F.ArID, A.name FROM Favorite_Artist F
            JOIN Artist A ON F.ArID = A.ArtistID
            WHERE F.PrID = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            res.json({ allArtists: results });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/notFavUserArtist/:id', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const artistId = req.params.id;
        const query = `DELETE FROM Favorite_Artist WHERE PrID = ? AND ArID = ?`;

        db.query(query, [userId, artistId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});

// favorite artist

// concert 
app.get('/Concert', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = 'SELECT COUNT(*) AS count FROM artist WHERE ArtistID = ?';
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            if (results[0].count > 0) {
                res.sendFile(path.join(__dirname, 'public', 'artistconcert.html'));
            }
            else {
                res.sendFile(path.join(__dirname, 'public', 'userconcert.html'));
            }
        });
    } else {
        res.redirect('/');
    }
});

// artist concert
app.post('/addConcert', upload.none(), (req, res) => {
    if (req.session.loggedin) {
        const { country, price } = req.body;
        const userId = req.session.userId;

        db.query('INSERT INTO Concert (ArtistID, Price, country) VALUES (?, ?, ?)', [userId, price, country], (err, results) => {
            if (err) {
                console.error('Insert concert error:', err);
                res.status(500).send('Internal server error');
                return;
            }

            const concertId = results.insertId;

            db.query('INSERT INTO Concert_Ticket (ConcertID, isValid) VALUES (?, TRUE)', [concertId], (err, results) => {
                if (err) {
                    console.error('Insert ticket error:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                res.send('Concert and ticket added successfully');
            });
        });
    } else {
        res.redirect('/');
    }
});


app.get('/getConcerts', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const query = `
            SELECT ConcertID,ArtistID,country,Price from Concert where ArtistID = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) throw err;
            res.json({ concerts: results });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/removeconcert/:id', (req, res) => {
    if (req.session.loggedin) {
        const concertId = req.params.id;
        const query = `DELETE FROM Concert WHERE ConcertID = ?`;

        db.query(query, [concertId], (err, result) => {
            if (err) throw err;
            res.json({ success: true });
        });
    }
});
// artist concert

// user concert

app.get('/userconcerts', (req, res) => {
    const query = `
        SELECT Concert.ConcertID as id, Artist.name as artist, Concert.Price as price,Concert.country
        FROM Concert 
        JOIN Artist ON Concert.ArtistID = Artist.ArtistID;
    `;

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Internal server error');
            return;
        }
        res.json({ concerts: results });
    });
});

app.get('/userreserved', (req, res) => {
    const userId = req.session.userId;

    const query = `
        SELECT Concert.ConcertID as id, Artist.name as artist, Concert.Country as country,Concert.Price as price 
        FROM User_Ticket 
        JOIN Concert_Ticket ON User_Ticket.TID = Concert_Ticket.TicketID 
        JOIN Concert ON Concert_Ticket.ConcertID = Concert.ConcertID 
        JOIN Artist ON Concert.ArtistID = Artist.ArtistID 
        WHERE User_Ticket.PrID = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).send('Internal server error');
            return;
        }
        res.json({ reserved: results });
    });
});

app.post('/userreserve', (req, res) => {
    const userId = req.session.userId;
    const { concertId, price } = req.body;

    const getUserQuery = 'SELECT wallet FROM Users WHERE UserID = ?';
    const reserveTicketQuery = `
        INSERT INTO User_Ticket (PrID, TID)
        SELECT ?, TicketID FROM Concert_Ticket WHERE ConcertID = ? AND isValid = TRUE LIMIT 1;
    `;
    const updateUserWalletQuery = 'UPDATE Users SET wallet = wallet - ? WHERE UserID = ?';

    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction error:', err);
            res.status(500).send('Internal server error');
            return;
        }

        db.query(getUserQuery, [userId], (err, results) => {
            if (err || results.length === 0 || results[0].wallet < price) {
                db.rollback();
                res.json({ success: false, message: 'Insufficient funds or user not found' });
                return;
            }

            db.query(reserveTicketQuery, [userId, concertId], (err, results) => {
                if (err || results.affectedRows === 0) {
                    db.rollback();
                    res.json({ success: false, message: 'Failed to reserve concert' });
                    return;
                }

                db.query(updateUserWalletQuery, [price, userId], (err) => {
                    if (err) {
                        db.rollback();
                        res.json({ success: false, message: 'Failed to update wallet' });
                        return;
                    }

                    db.commit(err => {
                        if (err) {
                            db.rollback();
                            res.json({ success: false, message: 'Transaction commit failed' });
                            return;
                        }

                        res.json({ success: true });
                    });
                });
            });
        });
    });
});

app.post('/userremove', (req, res) => {
    const userId = req.session.userId;
    const { concertId, price } = req.body;

    const deleteReservationQuery = `
        DELETE FROM User_Ticket 
        WHERE PrID = ? AND TID IN (SELECT TicketID FROM Concert_Ticket WHERE ConcertID = ?);
    `;
    const updateUserWalletQuery = 'UPDATE Users SET wallet = wallet + ? WHERE UserID = ?';
    console.log(userId);
    console.log(price);

    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction error:', err);
            res.status(500).send('Internal server error');
            return;
        }

        db.query(deleteReservationQuery, [userId, concertId], (err, results) => {
            if (err || results.affectedRows === 0) {
                db.rollback();
                res.json({ success: false, message: 'Failed to remove reservation' });
                return;
            }

            db.query(updateUserWalletQuery, [price, userId], (err) => {
                if (err) {
                    db.rollback();
                    res.json({ success: false, message: 'Failed to update wallet' });
                    return;
                }

                db.commit(err => {
                    if (err) {
                        db.rollback();
                        res.json({ success: false, message: 'Transaction commit failed' });
                        return;
                    }

                    res.json({ success: true });
                });
            });
        });
    });
});

// user concert

// add album

app.get('/AddAlbum', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'addalbum.html'));
    } else {
        res.redirect('/');
    }
});

app.post('/addAlbum', upload.none(), (req, res) => {
    const { title, genre, country, age, songs } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [req.session.username], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user information');
        }
        if (userResults.length > 0) {
            const artistId = userResults[0].UserID;

            const albumQuery = 'INSERT INTO Album (Title, ArtistID, genre, country, age) VALUES (?, ?, ?, ?, ?)';
            db.query(albumQuery, [title, artistId, genre, country, age], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error adding album');
                }

                const songIds = JSON.parse(songs);
                songIds.forEach(songId => {
                    const albumSongQuery = 'INSERT INTO Albums_Songs (SongID, Album_Title) VALUES (?, ?)';
                    db.query(albumSongQuery, [songId, title], (err, result) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                });

                res.send('Album created successfully');
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// add album

// delete album

app.get('/DeleteAlbum', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'deletealbum.html'));
    } else {
        res.redirect('/');
    }
});

app.post('/deletealbumartist', upload.none(), (req, res) => {
    if (req.session.loggedin) {
        const albumname = req.body.name;
        const findSongsQuery = `
            SELECT SongID FROM Albums_Songs WHERE Album_Title = ?
        `;

        db.query(findSongsQuery, [albumname], (err, results) => {
            if (err) throw err;

            const songIDs = results.map(row => row.SongID);

            const deleteAlbumsSongsQuery = `
                DELETE FROM Albums_Songs WHERE Album_Title = ?
            `;

            db.query(deleteAlbumsSongsQuery, [albumname], (err, results) => {
                if (err) throw err;

                if (songIDs.length > 0) {
                    const deleteSongsQuery = `
                        DELETE FROM Songs WHERE SongID IN (?)
                    `;

                    db.query(deleteSongsQuery, [songIDs], (err, results) => {
                        if (err) throw err;

                        const deleteAlbumQuery = `
                            DELETE FROM Album WHERE Title = ?
                        `;

                        db.query(deleteAlbumQuery, [albumname], (err, results) => {
                            if (err) throw err;
                            res.send('Album and associated songs removed successfully');
                        });
                    });
                } else {
                    const deleteAlbumQuery = `
                        DELETE FROM Album WHERE Title = ?
                    `;

                    db.query(deleteAlbumQuery, [albumname], (err, results) => {
                        if (err) throw err;
                        res.send('Album removed successfully');
                    });
                }
            });
        });
    } else {
        res.redirect('/');
    }
});

// delete album

// playlists

app.get('/Playlists', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'playlists.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getAllPlaylists', (req, res) => {
    if (req.session.userId) {
        const query = `
            SELECT 
                p.PlaylistID AS id, p.name AS playlist_name,
                s.SongID AS song_id, s.name AS song_name, a.name AS artist_name,
                s.audio_file AS audio_file, -- Assuming audio_file is stored in the Songs table
                c.Comment AS comment, c.PrID AS commenterId, u.username AS commenter_name
            FROM Playlists p
            LEFT JOIN Playlist_Songs ps ON p.PlaylistID = ps.PID
            LEFT JOIN Songs s ON ps.SID = s.SongID
            LEFT JOIN Artist a ON s.ArtistID = a.ArtistID
            LEFT JOIN Comments c ON p.PlaylistID = c.PID
            LEFT JOIN Users u ON c.PrID = u.UserID
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching playlists');
            }

            const playlistsMap = results.reduce((acc, row) => {
                if (!acc[row.id]) {
                    acc[row.id] = {
                        id: row.id,
                        name: row.playlist_name,
                        songs: [],
                        comments: []
                    };
                }
                if (row.song_id) {
                    acc[row.id].songs.push({
                        id: row.song_id,
                        name: row.song_name,
                        artist_name: row.artist_name,
                        audio_file: row.audio_file ? row.audio_file.toString('base64') : null // Encoding audio file to base64
                    });
                }
                if (row.comment) {
                    acc[row.id].comments.push({
                        commenterId: row.commenterId,
                        commenterName: row.commenter_name,
                        text: row.comment
                    });
                }
                return acc;
            }, {});

            res.json(Object.values(playlistsMap));
        });
    } else {
        res.status(401).send('User not logged in');
    }
});

app.post('/likePlaylist', (req, res) => {
    const { playlistId } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO Likes (PrID, PID) VALUES (?, ?)';
    db.query(sql, [userId, playlistId], (err, result) => {
        if (err) throw err;
        res.send('Playlist liked!');
    });
});

app.post('/addToFavoritePlaylist', (req, res) => {
    const { playlistId } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO Favorite (PrID, PID) VALUES (?, ?)';
    db.query(sql, [userId, playlistId], (err, result) => {
        if (err) throw err;
        res.send('Playlist added to favorites!');
    });
});

app.post('/addPlaylistComment', (req, res) => {
    const { playlistId, comment } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO Comments (PrID, PID, Comment) VALUES (?, ?, ?)';
    db.query(sql, [userId, playlistId, comment], (err, result) => {
        if (err) throw err;
        res.send('Comment added!');
    });
});
// playlists

// my playlist

app.get('/MyPlaylist', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public', 'myplaylist.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getPlaylistsAndSongs', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;

        const query = `
            SELECT p.name AS playlistName, s.name AS songName, s.audio_file
            FROM Playlists p
            JOIN Playlist_Songs ps ON p.PlaylistID = ps.PID
            JOIN Songs s ON ps.SID = s.SongID
            JOIN PremiumUsers pu ON p.PremiumID = pu.PremiumID
            WHERE pu.PremiumID = ?`;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching playlists and songs');
            }

            const playlists = results.reduce((acc, row) => {
                if (!acc[row.playlistName]) {
                    acc[row.playlistName] = [];
                }
                acc[row.playlistName].push({
                    name: row.songName,
                    audio_file: row.audio_file.toString('base64')
                });
                return acc;
            }, {});

            res.json(playlists);
        });
    } else {
        res.status(401).send('User not logged in');
    }
});

// my playlist


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});