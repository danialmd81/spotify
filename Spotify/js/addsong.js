document.getElementById('addSongForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('genre', document.getElementById('genre').value);
    formData.append('country', document.getElementById('country').value);
    formData.append('age', document.getElementById('age').value);
    formData.append('lyric', document.getElementById('lyric').value);
    formData.append('is_limited', document.getElementById('is_limited').checked);
    formData.append('audio_file', document.getElementById('audio_file').files[0]);

    const response = await fetch('/addSong', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('Song added successfully!');
        loadSongs();
    } else {
        alert('Failed to add song.');
    }
});
async function loadSongs() {
    const response = await fetch('/getSongs');
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
                <audio controls>
                    <source src="data:audio/*;base64,${song.audio_file}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
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
    });
}


document.addEventListener('DOMContentLoaded', loadSongs);
