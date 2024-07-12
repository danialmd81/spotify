document.addEventListener('DOMContentLoaded', () => {
    fetch('/getUserType')
        .then(response => response.json())
        .then(data => {
            const userType = data.userType;
            const menu = document.getElementById('menu');

            const menus = {
                artist: ['Home', 'Songs', 'Playlists', 'Albums', 'Friends', 'Followers', 'Concert', 'Wallet', 'My Songs', 'My Playlist', 'Favorite Song', 'Favorite Playlist', 'Add Song', 'Add Album', 'Delete Song', 'Delete Album', , 'Chat', 'logout'],
                premium: ['Home', 'Songs', 'Playlists', 'Albums', 'Friends', 'Followers', 'Concert', 'Wallet', 'Favorite Song', , 'Favorite Playlist', 'Favorite artist', 'My Playlist', 'Chat', 'logout'],
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
