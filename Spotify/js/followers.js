document.getElementById('followersBtn').addEventListener('click', () => {
    fetch('/getNonFollowers')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('usersTable');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = '';

            data.nonFollowers.forEach(user => {
                const tr = document.createElement('tr');
                const tdUsername = document.createElement('td');
                tdUsername.textContent = user.username;

                const tdAction = document.createElement('td');
                const followBtn = document.createElement('button');
                followBtn.textContent = 'Follow';
                followBtn.addEventListener('click', () => {
                    fetch(`/followUser/${user.UserID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('User followed successfully!');
                                tr.remove();
                                loadFollowers();
                            } else {
                                alert('Failed to follow user.');
                            }
                        });
                });
                tdAction.appendChild(followBtn);

                tr.appendChild(tdUsername);
                tr.appendChild(tdAction);
                tbody.appendChild(tr);
            });

            table.classList.remove('hidden');
        });
});

function loadFollowers() {
    fetch('/getFollowers')
        .then(response => response.json())
        .then(data => {
            const followersList = document.getElementById('followersList');
            followersList.innerHTML = '';

            data.followers.forEach(follower => {
                const li = document.createElement('li');
                li.textContent = follower.username;

                const unfollowBtn = document.createElement('button');
                unfollowBtn.textContent = 'Unfollow';
                unfollowBtn.classList.add("unfollowBtn");
                unfollowBtn.addEventListener('click', () => {
                    fetch(`/unfollowUser/${follower.UserID}`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('User unfollowed successfully!');
                                li.remove(); // Remove the list item from the followers list
                                loadFollowers();
                            } else {
                                alert('Failed to unfollow user.');
                            }
                        });
                });

                li.appendChild(unfollowBtn);
                followersList.appendChild(li);
            });
        });
}

loadFollowers();
