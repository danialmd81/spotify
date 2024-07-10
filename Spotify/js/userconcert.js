document.addEventListener('DOMContentLoaded', () => {
    fetch('/userconcerts')
        .then(response => response.json())
        .then(data => {
            const concertList = document.getElementById('concert-list');
            data.concerts.forEach(concert => {
                const li = document.createElement('li');
                li.textContent = `${concert.artist} - ${concert.country} - ${concert.price} USD`;
                const button = document.createElement('button');
                button.textContent = 'Reserve';
                button.addEventListener('click', () => reserveConcert(concert.id, concert.price));
                li.appendChild(button);
                concertList.appendChild(li);
            });
        });

    fetch('/userreserved')
        .then(response => response.json())
        .then(data => {
            const reservedList = document.getElementById('reserved-list');
            data.reserved.forEach(concert => {
                const li = document.createElement('li');
                li.textContent = `${concert.artist} - ${concert.country}`;
                const button = document.createElement('button');
                button.textContent = 'Remove';
                button.addEventListener('click', () => removeReservation(concert.id, concert.price));
                li.appendChild(button);
                reservedList.appendChild(li);
            });
        });
});

function reserveConcert(concertId, price) {
    fetch('/userreserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ concertId, price })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert(data.message);
            }
        });
}

function removeReservation(concertId, price) {
    fetch('/userremove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ concertId, price })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert(data.message);
            }
        });
}

