document.addEventListener('DOMContentLoaded', () => {
    const friendsList = document.getElementById('friends-list');
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    let currentFriend = null;

    // Fetch friends list from the server
    fetch('/getfriendsforchat')
        .then(response => response.json())
        .then(friends => {
            friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;
                li.dataset.friendId = friend.UserID;
                li.addEventListener('click', () => openChat(friend.UserID));
                friendsList.appendChild(li);
            });
        });

    // Fetch chat messages
    function openChat(friendId) {
        currentFriend = friendId;
        messagesDiv.innerHTML = '';
        fetch(`/messages?friendId=${friendId}`)
            .then(response => response.json())
            .then(messages => {
                messages.forEach(message => {
                    const div = document.createElement('div');
                    div.textContent = `${message.sender_name}: ${message.text}`;
                    messagesDiv.appendChild(div);
                });
            });
    }

    // Send a new message
    sendButton.addEventListener('click', () => {
        const text = messageInput.value;
        if (text.trim() !== '') {
            fetch('/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friendId: currentFriend, text })
            }).then(response => response.json())
                .then(message => {
                    const div = document.createElement('div');
                    div.textContent = `Me: ${message.text}`;
                    messagesDiv.appendChild(div);
                    messageInput.value = '';
                });
        }
    });
});
