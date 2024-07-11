const getStartedBtn = document.querySelectorAll(".btn-primary");

getStartedBtn.forEach(button => {
    button.addEventListener("click", () => {
        const cardDiv = button.closest(".card-Premium");
        const priceParagraph = cardDiv.querySelector("p");
        const priceText = priceParagraph.textContent;
        const priceMatch = priceText.match(/\$([0-9]+\.[0-9]+)/);
        const value = parseFloat(priceMatch[0].slice(1))
        let duration = 0;
        if (value < 10) {
            duration = 30;
        }
        else if (value < 20) {
            duration = 60;
        }
        else {
            duration = 90;
        }

        fetch('/wallet/take', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: value, duration: duration })
        })
            .then(response => response.json())
            .then(data => {
                const walletMessage = document.getElementById("walletMessage");
                if (data.error) {
                    walletMessage.textContent = data.error;
                    walletMessage.style.backgroundColor = "#ffcccb";
                    walletMessage.style.color = "#d8000c";
                } else {
                    walletMessage.textContent = data.message;
                    window.location.href = '/addToPremium';
                }
                walletMessage.style.display = 'block';
            });
    })

});