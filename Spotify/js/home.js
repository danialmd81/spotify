document.addEventListener('DOMContentLoaded', () => {
    fetch('/getUserType')
        .then(response => response.json())
        .then(data => {
            const userType = data.userType;
            const menu = document.getElementById('menu');

            const menus = {
                artist: ['Home', 'Songs', 'Playlists', 'Friends', 'Followers', 'Concert', 'Wallet', 'My Songs', 'My Playlist', 'Favorite Song', 'Add Song', 'Add Album', 'Delete Song', 'Delete Album', 'logout'],
                premium: ['Home', 'Songs', 'Playlists', 'Friends', 'Followers', 'Concert', 'Wallet', 'Favorite Song', 'Favorite artist', 'My Playlist', 'logout'],
                normal: ['Home', 'Songs', 'Wallet', 'Buy Premium Account', 'logout']
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
