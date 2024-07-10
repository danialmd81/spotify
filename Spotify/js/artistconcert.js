document.getElementById('addConcertForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('country', document.getElementById('country').value);
    formData.append('price', parseInt(document.getElementById('price').value));

    const response = await fetch('/addConcert', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        loadConcerts();
    } else {
        alert('Failed to add song.');
    }
});

async function loadConcerts() {
    fetch('/getConcerts')
        .then(response => response.json())
        .then(data => {
            const concertssList = document.getElementById('concertList');
            concertssList.innerHTML = '';

            data.concerts.forEach(concert => {
                const li = document.createElement('li');
                const p = document.createElement('p');
                p.textContent = concert.country;

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'remove';
                removeBtn.classList.add("removeBtn");
                removeBtn.addEventListener('click', () => {
                    fetch(`/removeconcert/${concert.ConcertID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('concert remove successfully!');
                                li.remove();
                                loadFollowers();
                            } else {
                                alert('Failed to unfollow user.');
                            }
                        });
                });

                //li.appendChild(removeBtn);
                li.appendChild(p);
                li.appendChild(removeBtn);
                concertssList.appendChild(li);

            });
        });
}


loadConcerts();
