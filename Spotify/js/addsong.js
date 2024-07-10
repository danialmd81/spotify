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
    } else {
        alert('Failed to add song.');
    }
});

