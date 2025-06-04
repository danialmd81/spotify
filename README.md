# Spotify Clone - Database Project

A full-stack web application that replicates core features of Spotify, built as a database course project.

## Project Overview

This Spotify clone demonstrates the implementation of a music streaming platform with both free and premium user features. The application includes functionalities for user accounts, music management, playlists, social interactions, and premium features.

## Key Features

- **User Management**
  - Registration and login system
  - Free and premium user tiers
  - Wallet system for in-app transactions

- **Music Content**
  - Song and album management
  - Playlist creation and management
  - Comments and likes on songs, albums, and playlists

- **Social Features**
  - Friend system with request management
  - Followers system
  - Messaging between premium users
  - Activity feed for friends

- **Artist Features**
  - Artist profiles
  - Concert management
  - Album and song publishing

- **Premium Features**
  - Access to premium-only content
  - Concert tickets
  - Extended social features

## Database Schema

The application is built on a relational database with tables for:

- Users (regular and premium)
- Artists
- Songs and Albums
- Playlists
- Social connections (friends, followers)
- User interactions (likes, comments, favorites)
- Concerts and tickets

## Technology Stack

### Frontend

- **HTML5, CSS3, JavaScript** - For structure, styling, and client-side functionality
- **Responsive Design** - For various device compatibility

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database management system
- **express-session** - Session management
- **multer** - File upload handling for audio files
- **body-parser** - Request parsing middleware

### Architecture

- RESTful API design
- MVC-inspired architecture
- Event-driven database procedures

## Getting Started

To get started with this project, follow these steps:

1. **Set up the Database**:
   - Run the SQL scripts located in the [`Database/createtable.sql`](/Database/createtable.sql) file to create the database and its tables
   - This will set up the MySQL database with all required tables and initial data

2. **Install Dependencies**:
   - Navigate to the [`Spotify/`](/Spotify/) directory
   - Run `npm install` to install the necessary Node.js dependencies

3. **Configure Database Connection**:
   - In `server.js`, update the MySQL connection details if needed:

     ```javascript
     const db = mysql.createConnection({
         host: 'localhost',
         user: 'root',
         password: 'your_password',
         database: 'spotify'
     });
     ```

4. **Start the Server**:
   - In the `Spotify/` directory, run `node server.js` to start the server
   - By default, the server will listen on port 3000

5. **Access the Application**:
   - Open a web browser and go to `http://localhost:3000`
   - You will be directed to the login page

## Project Structure

- **`/Database`**: Contains SQL scripts for database setup
- **`/ER`**: Contains Entity-Relationship diagrams
- **`/Spotify`**: Main application directory
  - **`/public`**: HTML pages for different features
  - **`/js`**: Client-side JavaScript files
  - **`/style`**: CSS stylesheets
  - **`server.js`**: Main server file with API endpoints

## Contributors

- [**Danial**](https://github.com/danialmd81)
- [**Sobhan**](https://github.com/sobhanagh)

## License

This project is an academic exercise and is not intended for commercial use.

## Acknowledgements

This project was created as part of the Database course requirements at IUT.

---

We hope you find this project informative and insightful. It was a great learning experience for us, and we are excited to share it with you. For any questions or contributions, feel free to reach out to us.

Thank you for checking out our Spotify Clone project!
