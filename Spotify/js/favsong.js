document.getElementById('showSongsBtn').addEventListener('click', () => {
    fetch('/getNonFavSongs')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('songsTable');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = '';

            data.nonFavSongs.forEach(song => {
                const tr = document.createElement('tr');
                const tdSongname = document.createElement('td');
                tdSongname.textContent = song.name;

                const tdAction = document.createElement('td');
                const addFavBtn = document.createElement('button');
                addFavBtn.textContent = 'Add To Favorite';
                addFavBtn.addEventListener('click', () => {
                    fetch(`/favUserSong/${song.SongID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                tr.remove();
                                loadSongs();
                            } else {
                                alert('Failed');
                            }
                        });
                });
                tdAction.appendChild(addFavBtn);

                tr.appendChild(tdSongname);
                tr.appendChild(tdAction);
                tbody.appendChild(tr);
            });

            table.classList.remove('hidden');
        });
});

function loadSongs() {
    fetch('/getAllSongs')
        .then(response => response.json())
        .then(data => {
            const followersList = document.getElementById('songsList');
            followersList.innerHTML = '';

            data.allSongs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song.name;

                const removeFavBtn = document.createElement('button');
                removeFavBtn.textContent = 'Remove From Favorite';
                removeFavBtn.classList.add("removeFavBtn");
                removeFavBtn.addEventListener('click', () => {
                    fetch(`/notFavUserSong/${song.SongID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                li.remove();
                                loadSongs();
                            } else {
                                alert('Failed');
                            }
                        });
                });

                li.appendChild(removeFavBtn);
                followersList.appendChild(li);
            });
        });
}

loadSongs();
