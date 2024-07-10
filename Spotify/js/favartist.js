document.getElementById('showArtistsBtn').addEventListener('click', () => {
    fetch('/getNonFavArtist')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('artistsTable');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = '';

            data.nonFavArtists.forEach(artist => {
                const tr = document.createElement('tr');
                const tdArtistname = document.createElement('td');
                tdArtistname.textContent = artist.name;

                const tdAction = document.createElement('td');
                const addFavBtn = document.createElement('button');
                addFavBtn.textContent = 'Add To Favorite';
                addFavBtn.addEventListener('click', () => {
                    fetch(`/favUserArtist/${artist.ArtistID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                tr.remove();
                                loadArtists();
                            } else {
                                alert('Failed');
                            }
                        });
                });
                tdAction.appendChild(addFavBtn);

                tr.appendChild(tdArtistname);
                tr.appendChild(tdAction);
                tbody.appendChild(tr);
            });

            table.classList.remove('hidden');
        });
});

function loadArtists() {
    fetch('/getAllArtists')
        .then(response => response.json())
        .then(data => {
            const artistList = document.getElementById('artistsList');
            artistList.innerHTML = '';

            data.allArtists.forEach(artist => {
                const li = document.createElement('li');
                li.textContent = artist.name;

                const removeFavBtn = document.createElement('button');
                removeFavBtn.textContent = 'Remove From Favorite';
                removeFavBtn.classList.add("removeFavBtn");
                removeFavBtn.addEventListener('click', () => {
                    fetch(`/notFavUserArtist/${artist.ArID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                li.remove();
                                loadArtists();
                            } else {
                                alert('Failed');
                            }
                        });
                });

                li.appendChild(removeFavBtn);
                artistList.appendChild(li);
            });
        });
}

loadArtists();
