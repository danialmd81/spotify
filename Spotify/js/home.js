document.addEventListener('DOMContentLoaded', () => {
    fetch('/getUserType')
        .then(response => response.json())
        .then(data => {
            const userType = data.userType;
            const menu = document.getElementById('menu');

            const menus = {
                artist: ['Home', 'Songs', 'Friends', 'Followers', 'Concert', 'Wallet', 'My Songs', 'Add Song', 'Add Album', 'Add Playlist', 'Create Playlist', 'Delete Song', 'Delete Album'],
                premium: ['Home', 'Songs', 'Friends', 'Followers', 'Concert', 'Wallet', 'Playlist', 'Favorite Song', 'Favorite artist'],
                normal: ['Home', 'Songs', 'Wallet', 'Buy Premium Account', 'Favorite Song', 'Favorite artist']
            };

            const userMenu = menus[userType];

            userMenu.forEach(item => {
                const li = document.createElement('li');
                const aTag = document.createElement('a');
                aTag.href = item.split(" ").join("");
                aTag.textContent = item;
                li.appendChild(aTag);
                menu.appendChild(li);
            });
        });
});
