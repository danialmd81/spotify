async function loadAlbums() {
    const response = await fetch('/getAllAlbums');
    const albums = await response.json();
    const albumsList = document.getElementById('albumsList');
    albumsList.innerHTML = '';

    albums.forEach(album => {
        const albumElement = document.createElement('div');
        albumElement.className = 'album-item';
        albumElement.innerHTML = `
            <h3>${album.title}</h3>
            <div class="album-details">
                <p>Artist: ${album.artist_name}</p>
            </div>
            <div class="album-controls">
                <button class="like-btn">Like</button>
            </div>
            <div class="songs-list">
                ${album.songs.map(song => `
                    <div class="song-item" data-song-id="${song.id}">
                        <p>${song.name} by ${song.artist_name}</p>
                        <div class="song-controls">
                            <span class="start">00:00</span>
                            <input class="music-time" type="range" value="0">
                            <span class="end">00:00</span>
                            <i class="fas fa-play play-btn"></i>
                            <audio controls>
                                <source src="data:audio/*;base64,${song.audio_file}" type="audio/mpeg">
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
                    ${album.comments ? album.comments.map(comment => `<div class="comment"><strong>${comment.commenterName}:</strong> ${comment.text}</div>`).join('') : ''}
                </div>
            </div>
        `;
        albumsList.appendChild(albumElement);

        albumElement.querySelector('.like-btn').addEventListener('click', async () => {
            await fetch('/likeAlbum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ albumTitle: album.title })
            });
            alert('Album liked!');
        });

        albumElement.querySelector('.comment-btn').addEventListener('click', async () => {
            const commentInput = albumElement.querySelector('.comment-input');
            const comment = commentInput.value;
            if (comment) {
                await fetch('/addAlbumComment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ albumTitle: album.title, comment })
                });
                const commentsDiv = albumElement.querySelector('.comments');
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `<strong>You:</strong> ${comment}`;
                commentsDiv.appendChild(commentElement);
                commentInput.value = '';
            }
        });

        const songElements = albumElement.querySelectorAll('.song-item');
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

document.addEventListener('DOMContentLoaded', loadAlbums);
