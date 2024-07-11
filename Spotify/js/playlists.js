async function loadPlaylists() {
    const response = await fetch('/getAllPlaylists');
    const playlists = await response.json();
    const playlistsList = document.getElementById('playlistsList');
    playlistsList.innerHTML = '';

    playlists.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.className = 'playlist-item';
        playlistElement.innerHTML = `
            <h3>${playlist.name}</h3>
            <div class="playlist-controls">
                <button class="like-btn">Like</button>
                <button class="favorite-btn">Add to Favorite</button>
            </div>
            <div class="songs-list">
                ${playlist.songs.map(song => `
                    <div class="song-item" data-song-id="${song.id}">
                        <p>${song.name} by ${song.artist_name}</p>
                        <div class="song-controls">
                            <span class="start">00:00</span>
                            <input class="music-time" type="range" value="0">
                            <span class="end">00:00</span>
                            <i class="fas fa-play play-btn"></i>
                            <audio controls>
                                <source src="data:audio/mpeg;base64,${song.audio_file}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="comment-section">
                <input type="text" placeholder="Add a comment" class="comment-input">
                <button class="comment-btn">Comment</button>
                <div class="comments">
                    ${playlist.comments ? playlist.comments.map(comment => `<div class="comment"><strong>${comment.commenterName}:</strong> ${comment.text}</div>`).join('') : ''}
                </div>
            </div>
        `;
        playlistsList.appendChild(playlistElement);

        playlistElement.querySelector('.like-btn').addEventListener('click', async () => {
            await fetch('/likePlaylist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId: playlist.id })
            });
            alert('Playlist liked!');
        });

        playlistElement.querySelector('.favorite-btn').addEventListener('click', async () => {
            await fetch('/addToFavoritePlaylist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId: playlist.id })
            });
            alert('Playlist added to favorites!');
        });

        playlistElement.querySelector('.comment-btn').addEventListener('click', async () => {
            const commentInput = playlistElement.querySelector('.comment-input');
            const comment = commentInput.value;
            if (comment) {
                await fetch('/addPlaylistComment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playlistId: playlist.id, comment })
                });
                const commentsDiv = playlistElement.querySelector('.comments');
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `<strong>You:</strong> ${comment}`;
                commentsDiv.appendChild(commentElement);
                commentInput.value = '';
            }
        });

        const songElements = playlistElement.querySelectorAll('.song-item');
        songElements.forEach(songElement => {
            const audio = songElement.querySelector('audio');
            const playBtn = songElement.querySelector('.play-btn');
            const range = songElement.querySelector('.music-time');
            const startTime = songElement.querySelector('.start');
            const endTime = songElement.querySelector('.end');

            function timeForMusic(time) {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
        });
    });
}

document.addEventListener('DOMContentLoaded', loadPlaylists);
