async function loadPlaylists() {
    const response = await fetch('/getAllFavPlaylists');
    const playlists = await response.json();
    const playlistsList = document.getElementById('playlistsList');
    playlistsList.innerHTML = '';

    playlists.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.className = 'playlist-item';
        playlistElement.innerHTML = `
            <div class="playlist-item-header">
                <h3>${playlist.name}</h3>
                <i class="fas fa-trash delete-btn"></i>
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
        `;
        playlistsList.appendChild(playlistElement);

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
        const deleteBtn = playlistElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            const playlistname = playlist.name;
            try {
                const response = await fetch('/deleteFavPlaylist', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: playlistname })
                });

                if (response.ok) {
                    loadPlaylists(); // Reload songs after deletion
                } else {
                    console.error('Error deleting playlist:', await response.text());
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', loadPlaylists);
