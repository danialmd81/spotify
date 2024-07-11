CREATE DATABASE Spotify;

USE Spotify;

CREATE TABLE Users (
    UserID INT PRIMARY KEY auto_increment,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    birthday DATE NOT NULL,
    address VARCHAR(255),
    wallet DECIMAL(10, 2) DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE PremiumUsers (
    PremiumID INT PRIMARY KEY,
    Duration INT NULL,
    FOREIGN KEY (PremiumID) REFERENCES Users (UserID) on DELETE CASCADE
);

CREATE TABLE Artist (
    ArtistID INT PRIMARY KEY,
    name VARCHAR(255),
    FOREIGN KEY (ArtistID) REFERENCES Users (UserID) on DELETE CASCADE
);

CREATE TABLE Album (
    Title VARCHAR(255) PRIMARY KEY,
    ArtistID INT,
    genre VARCHAR(255),
    country VARCHAR(255),
    age INT,
    FOREIGN KEY (ArtistID) REFERENCES Artist (ArtistID) ON DELETE CASCADE
);

CREATE Table Albums_Songs (
    SongID INT,
    Album_Title VARCHAR(255),
    PRIMARY KEY (SongID, Album_Title),
    Foreign Key (SongID) REFERENCES Songs (SongID) on DELETE CASCADE,
    Foreign Key (Album_Title) REFERENCES Album (Title) on DELETE CASCADE
)

CREATE TABLE Songs (
    SongID INT PRIMARY KEY auto_increment,
    ArtistID INT,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    age VARCHAR(255) NOT NULL,
    lyric VARCHAR(1024) NOT NULL,
    is_limited BOOLEAN DEFAULT FALSE,
    audio_file LONGBLOB,
    Foreign Key (ArtistID) REFERENCES Artist (ArtistID) on DELETE CASCADE
);

CREATE TABLE Playlists (
    PlaylistID INT PRIMARY KEY auto_increment,
    PremiumID INT,
    name VARCHAR(255) NOT NULL,
    isPrivate BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (PremiumID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE
);

CREATE TABLE Playlist_Songs (
    PID INT,
    SID INT,
    PRIMARY KEY (PID, SID),
    Foreign Key (PID) REFERENCES Playlists (PlaylistID) on DELETE CASCADE,
    Foreign Key (SID) REFERENCES Songs (SongID) on DELETE CASCADE
);

CREATE Table Concert (
    ConcertID INT PRIMARY KEY auto_increment,
    ArtistID INT,
    Price INT,
    country VARCHAR(255),
    Foreign Key (ArtistID) REFERENCES Artist (ArtistID) ON DELETE CASCADE
);

CREATE TABLE Concert_Ticket (
    TicketID INT PRIMARY KEY auto_increment,
    ConcertID INT,
    isValid BOOLEAN,
    Foreign Key (ConcertID) REFERENCES Concert (ConcertID) on DELETE CASCADE
);

CREATE TABLE User_Ticket (
    PrID INT,
    TID INT,
    PRIMARY KEY (PrID, TID),
    Foreign Key (PrID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE,
    Foreign Key (TID) REFERENCES Concert_Ticket (TicketID) on DELETE CASCADE
);

CREATE TABLE Friends (
    PremiumID INT,
    FriendID INT,
    PRIMARY KEY (PremiumID, FriendID),
    FOREIGN KEY (FriendID) REFERENCES PremiumUsers (PremiumID),
    FOREIGN KEY (PremiumID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE
);

CREATE TABLE Followers (
    PremiumID INT,
    FollowerID INT,
    PRIMARY KEY (PremiumID, FollowerID),
    FOREIGN KEY (FollowerID) REFERENCES PremiumUsers (PremiumID),
    FOREIGN KEY (PremiumID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE
);

CREATE Table Comments (
    ID INT PRIMARY KEY auto_increment,
    PrID INT,
    PID INT NULL,
    SID INT NULL,
    ATitle VARCHAR(255) NULL,
    Comment VARCHAR(1024),
    Foreign Key (PrID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE,
    Foreign Key (PID) REFERENCES Playlists (PlaylistID) on DELETE CASCADE,
    Foreign Key (SID) REFERENCES Songs (SongID) on DELETE CASCADE,
    Foreign Key (ATitle) REFERENCES Album (Title) on DELETE CASCADE
);

CREATE Table Likes (
    ID INT PRIMARY KEY auto_increment,
    PrID INT,
    PID INT NULL,
    SID INT NULL,
    ATitle VARCHAR(255) NULL,
    Foreign Key (PrID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE,
    Foreign Key (PID) REFERENCES Playlists (PlaylistID) on DELETE CASCADE,
    Foreign Key (SID) REFERENCES Songs (SongID) on DELETE CASCADE,
    Foreign Key (ATitle) REFERENCES Album (Title) on DELETE CASCADE
);

CREATE Table Favorite (
    ID INT PRIMARY KEY auto_increment,
    PrID INT,
    PID INT NULL,
    SID INT NULL,
    ATitle VARCHAR(255) NULL,
    Foreign Key (PrID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE,
    Foreign Key (PID) REFERENCES Playlists (PlaylistID) on DELETE CASCADE,
    Foreign Key (SID) REFERENCES Songs (SongID) on DELETE CASCADE,
    Foreign Key (ATitle) REFERENCES Album (Title) on DELETE CASCADE
);

CREATE Table Favorite_Artist (
    PrID INT,
    ArID INT,
    PRIMARY KEY (PrID, ArID),
    Foreign Key (PrID) REFERENCES PremiumUsers (PremiumID) on DELETE CASCADE,
    Foreign Key (ArID) REFERENCES Artist (ArtistID) on DELETE CASCADE
);

DELIMITER $$

CREATE PROCEDURE DecreaseDuration()
BEGIN
    UPDATE PremiumUsers
    SET Duration = Duration - 1
END$$

DELIMITER;

-- Create an event to call the procedure every 24 hours
CREATE EVENT DecreaseDurationEvent ON SCHEDULE EVERY 1 DAY STARTS (
    TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY
) -- Starts the next day
DO
CALL DecreaseDuration ();

DELIMITER $$

CREATE TRIGGER AfterDurationDecrease
AFTER UPDATE ON PremiumUsers
FOR EACH ROW
BEGIN
    IF NEW.Duration = 0 THEN
        -- Assuming there's a corresponding record in the Users table that can be flagged as non-premium
        UPDATE Users
        SET is_premium = FALSE
        WHERE `UserID` = NEW.PremiumID;
        
        -- Optionally, remove the user from PremiumUsers table if that's the desired behavior
        DELETE FROM PremiumUsers WHERE `PremiumID` = NEW.PremiumID;
    END IF;
END$$

DELIMITER;