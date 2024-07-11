async function loadSongs() {
    const response = await fetch('/getAllFavSongs');
    const songs = await response.json();
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '';
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        songElement.innerHTML = `
            <h3>${song.name}</h3>
            <div class="song-controls">
                <span class="start">00:00</span>
                <input class="music-time" type="range" value="0">
                <span class="end">00:00</span>
                <i class="fas fa-play play-btn"></i>
                <i class="fas fa-trash delete-btn"></i>
                <audio controls>
                    <source src="data:audio/*;base64,${song.audio_file}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `;
        songsList.appendChild(songElement);

        const audio = songElement.querySelector('audio');
        const playBtn = songElement.querySelector('.play-btn');
        const deleteBtn = songElement.querySelector('.delete-btn');
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

        deleteBtn.addEventListener('click', async () => {
            const songName = song.name;
            const response = await fetch('/deleteFavSong', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: songName })
            });

            if (response.ok) {
                loadSongs(); // Reload songs after deletion
            } else {
                console.error('Error deleting song');
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", loadSongs);
