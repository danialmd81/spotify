const songIds = [];

document.addEventListener("DOMContentLoaded", () => {
    const songsContainer = document.getElementById('songsContainer');

    const songForm = document.createElement('div');
    songForm.className = 'songForm';

    songForm.innerHTML = `
        <label for="name">Song Name:</label>
        <input type="text" class="name" name="name" required>

        <label for="genre">Genre:</label>
        <input type="text" class="genre" name="genre" required>

        <label for="country">Country:</label>
        <input type="text" class="country" name="country" required>

        <label for="age">Age:</label>
        <input type="text" class="age" name="age" required>

        <label for="lyric">Lyrics:</label>
        <textarea class="lyric" name="lyric" required></textarea>

        <label for="is_limited">Is Limited:</label>
        <input type="checkbox" class="is_limited" name="is_limited">

        <label for="audio_file">Audio File:</label>
        <input type="file" class="audio_file" name="audio_file" accept="audio/*" required>
    `;

    songsContainer.appendChild(songForm);
})

document.getElementById('addSongButton').addEventListener('click', async function () {

    const songs = document.querySelector('.songForm');

    const songFormData = new FormData();
    songFormData.append('name', songs.querySelector('.name').value);
    songFormData.append('genre', songs.querySelector('.genre').value);
    songFormData.append('country', songs.querySelector('.country').value);
    songFormData.append('age', songs.querySelector('.age').value);
    songFormData.append('lyric', songs.querySelector('.lyric').value);
    songFormData.append('is_limited', songs.querySelector('.is_limited').checked);
    songFormData.append('audio_file', songs.querySelector('.audio_file').files[0]);

    const songResponse = await fetch('/addSong', {
        method: 'POST',
        body: songFormData
    });

    if (songResponse.ok) {
        alert('song added to album.');
        const songId = await songResponse.text();
        songIds.push(songId);
    } else {
        alert('Failed to add song.');
        return;
    }
});

document.getElementById('addAlbumForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const albumData = new FormData();
    albumData.append('title', document.getElementById('title').value);
    albumData.append('genre', document.getElementById('albumGenre').value);
    albumData.append('country', document.getElementById('albumCountry').value);
    albumData.append('age', document.getElementById('albumAge').value);

    albumData.append('songs', JSON.stringify(songIds));

    const albumResponse = await fetch('/addAlbum', {
        method: 'POST',
        body: albumData
    });

    if (albumResponse.ok) {
        alert('Album created successfully!');
    } else {
        alert('Failed to create album.');
    }
});
