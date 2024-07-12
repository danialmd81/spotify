document.addEventListener('DOMContentLoaded', () => {
    fetch('/friends-activity')
        .then(response => response.json())
        .then(data => displayFriendsActivity(data))
        .catch(error => console.error('Error fetching friends activity:', error));
});

function displayFriendsActivity(activities) {
    const activityList = document.getElementById('friendsActivity');
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <p><strong>${activity.friendUsername}</strong> ${activity.action} on <strong>${activity.item}</strong></p>
            <p>${activity.comment || ''}</p>
        `;
        activityList.appendChild(activityItem);
    });
}
