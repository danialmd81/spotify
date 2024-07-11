document.addEventListener("DOMContentLoaded", () => {
    fetchFriendRequests();
    fetchFriendsList();
    document.getElementById('search-bar').addEventListener('input', searchUsers);
});

function searchUsers(event) {
    const query = event.target.value;
    if (query.length > 2) {
        fetch(`/search-users?query=${query}`)
            .then(response => response.json())
            .then(data => {
                const searchResults = document.getElementById('search-results');
                searchResults.innerHTML = '';
                data.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = user.username;
                    const sendRequestBtn = document.createElement('button');
                    sendRequestBtn.textContent = 'Send Request';
                    sendRequestBtn.onclick = () => sendFriendRequest(user.id);
                    li.appendChild(sendRequestBtn);
                    searchResults.appendChild(li);
                });
            });
    }
}

function sendFriendRequest(userId) {
    fetch(`/send-friend-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Friend request sent!');
            } else {
                alert('Error sending friend request.');
            }
        });
}

function fetchFriendRequests() {
    fetch('/friend-requests')
        .then(response => response.json())
        .then(data => {
            const requestsList = document.getElementById('requests-list');
            requestsList.innerHTML = '';
            data.forEach(request => {
                const li = document.createElement('li');
                li.textContent = request.username;
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Accept';
                acceptBtn.onclick = () => handleFriendRequest(request.id, true);
                const rejectBtn = document.createElement('button');
                rejectBtn.textContent = 'Reject';
                rejectBtn.classList.add('reject');
                rejectBtn.onclick = () => handleFriendRequest(request.id, false);
                li.appendChild(acceptBtn);
                li.appendChild(rejectBtn);
                requestsList.appendChild(li);
            });
        });
}

function fetchFriendsList() {
    fetch('/accepted-requests')
        .then(response => response.json())
        .then(data => {
            const acceptedList = document.getElementById('accepted-list-ul');
            acceptedList.innerHTML = '';
            data.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;
                acceptedList.appendChild(li);
            });
        });

    fetch('/rejected-requests')
        .then(response => response.json())
        .then(data => {
            const rejectedList = document.getElementById('rejected-list-ul');
            rejectedList.innerHTML = '';
            data.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;
                rejectedList.appendChild(li);
            });
        });


    fetch('/getfriends')
        .then(response => response.json())
        .then(data => {
            const friendsList = document.getElementById('friends-list-ul');
            friendsList.innerHTML = '';
            data.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;
                friendsList.appendChild(li);
            });
        });
}

function handleFriendRequest(requestId, accept) {
    fetch(`/friend-requests/${requestId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accept }),
    })
        .then(response => response.json())
        .then(() => {
            fetchFriendRequests();
            fetchFriendsList();
        });
}
