document.addEventListener('DOMContentLoaded', () => {
    fetch('/getUserType')
        .then(response => response.json())
        .then(data => {
            const userType = data.userType;
            const menu = document.getElementById('menu');

            const menus = {
                artist: ['Home', 'Songs', 'Friends', 'Followers', 'Concert', 'Wallet', 'My Songs', 'Favorite Song', 'Add Song', 'Add Album', 'Create Playlist', 'Delete Song', 'Delete Album', 'logout'],
                premium: ['Home', 'Songs', 'Friends', 'Followers', 'Concert', 'Wallet', 'Create Playlist', 'Favorite Song', 'Favorite artist', 'logout'],
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
