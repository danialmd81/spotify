// home.js
async function loadSongs() {
    const response = await fetch('/getAllSongs');
    const songs = await response.json();
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '';
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        songElement.innerHTML = `
            <h3>${song.name} by ${song.artist_name}</h3>
            <div class="song-controls">
                <span class="start">00:00</span>
                <input class="music-time" type="range" value="0">
                <span class="end">00:00</span>
                <i class="fas fa-play play-btn"></i>
                <audio controls>
                    <source src="data:audio/mpeg;base64,${song.audio_file}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="song-controls-btn">
                    <button class="like-btn">Like</button>
                    <button class="favorite-btn">Add to Favorite</button>
                </div>
            </div>
            <div class="comment-section">
                <input type="text" placeholder="Add a comment" class="comment-input">
                <button class="comment-btn">Comment</button>
                <div class="comments">
                    ${song.comments ? song.comments.map(comment => `<div class="comment"><strong>${comment.commenterName}:</strong> ${comment.text}</div>`).join('') : ''}
                </div>
            </div>
        `;
        songsList.appendChild(songElement);

        const audio = songElement.querySelector('audio');
        const playBtn = songElement.querySelector('.play-btn');
        const range = songElement.querySelector('.music-time');
        const startTime = songElement.querySelector('.start');
        const endTime = songElement.querySelector('.end');

        function timeForMusic(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
        }

        audio.addEventListener('canplay', () => {
            range.max = audio.duration;
            endTime.innerText = timeForMusic(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            range.value = audio.currentTime;
            startTime.innerText = timeForMusic(audio.currentTime);
        });

        range.addEventListener('input', () => {
            audio.currentTime = range.value;
        });

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.classList.replace('fa-play', 'fa-pause');
            } else {
                audio.pause();
                playBtn.classList.replace('fa-pause', 'fa-play');
            }
        });

        songElement.querySelector('.like-btn').addEventListener('click', async () => {
            await fetch('/likeSong', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ songId: song.id })
            });
            alert('Song liked!');
        });

        songElement.querySelector('.favorite-btn').addEventListener('click', async () => {
            await fetch('/addToFavorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ songId: song.id })
            });
            alert('Song added to favorites!');
        });

        songElement.querySelector('.comment-btn').addEventListener('click', async () => {
            const commentInput = songElement.querySelector('.comment-input');
            const comment = commentInput.value;
            if (comment) {
                await fetch('/addComment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ songId: song.id, comment })
                });
                const commentsDiv = songElement.querySelector('.comments');
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `<strong>You:</strong> ${comment}`;
                commentsDiv.appendChild(commentElement);
                commentInput.value = '';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', loadSongs);
