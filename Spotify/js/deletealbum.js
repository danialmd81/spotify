document.getElementById('deleteAlbumForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);

    const response = await fetch('/deletealbumartist', {
        method: 'POST',
        body: formData
    })

    if (response.ok) {
        alert('Song removed successfully!');
    }
    else {
        alert('Song removed failed!');
    }

});