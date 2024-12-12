document.addEventListener("DOMContentLoaded", () => {
    const applyRatingColors = () => {
        const ratingElements = document.querySelectorAll(".colorT");
        ratingElements.forEach((ratingElement) => {
            const rating = parseFloat(ratingElement.textContent.trim());
            if (rating >= 8) {
                ratingElement.style.color = "green";
                ratingElement.style.fontWeight = "bold";
            } else if (rating >= 5) {
                ratingElement.style.color = "orange";
            } else {
                ratingElement.style.color = "red";
            }
        });
    };

    const addHoverEffects = () => {
        const cards = document.querySelectorAll(".card");
        cards.forEach((card) => {
            card.addEventListener("mouseenter", () => {
                card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                card.style.transform = "scale(1.05)";
                card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
            });

            card.addEventListener("mouseleave", () => {
                card.style.boxShadow = "none";
                card.style.transform = "scale(1)";
            });
        });
    };

    const cycleBackgroundColors = () => {
        const colors = ["#f8f9fa", "#e9ecef", "#dee2e6"];
        let currentColorIndex = 0;

        setInterval(() => {
            document.body.style.backgroundColor = colors[currentColorIndex];
            currentColorIndex = (currentColorIndex + 1) % colors.length;
        }, 5000); 
    };

    const addCardBorderColors = () => {
        const cards = document.querySelectorAll(".card");
        cards.forEach((card, index) => {
            const colors = ["#6c757d", "#adb5bd", "#ced4da"];
            card.style.border = `2px solid ${colors[index % colors.length]}`;
            card.style.borderRadius = "8px";
            card.style.padding = "10px";
        });
    };

    const footerStyles = `
    footer {
        background-color: #333;
        color: white;
        padding: 20px 0;
        text-align: center;
        font-size: 14px;
    }
    footer a {
        color: #00aaff;
        text-decoration: none;
    }
    footer a:hover {
        text-decoration: underline;
    }
    footer p {
        margin: 5px 0;
    }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = footerStyles;
    document.head.appendChild(styleTag);

    const toggleDarkMode = () => {
        const darkModeButton = document.createElement("button");
        darkModeButton.textContent = "Toggle Dark Mode";
        darkModeButton.style.position = "fixed";
        darkModeButton.style.bottom = "10px";
        darkModeButton.style.right = "10px";
        darkModeButton.style.padding = "10px 15px";
        darkModeButton.style.backgroundColor = "#212529";
        darkModeButton.style.color = "#ffffff";
        darkModeButton.style.border = "none";
        darkModeButton.style.borderRadius = "5px";
        darkModeButton.style.cursor = "pointer";

        document.body.appendChild(darkModeButton);

        darkModeButton.addEventListener("click", () => {
            const isDarkMode = document.body.classList.toggle("dark-mode");
            if (isDarkMode) {
                document.body.style.backgroundColor = "#343a40";
                document.body.style.color = "#f8f9fa";
                darkModeButton.style.backgroundColor = "#f8f9fa";
                darkModeButton.style.color = "#343a40";
            } else {
                document.body.style.backgroundColor = "#ffffff";
                document.body.style.color = "#000000";
                darkModeButton.style.backgroundColor = "#212529";
                darkModeButton.style.color = "#ffffff";
            }
        });
    };

    applyRatingColors();
    addHoverEffects();
    cycleBackgroundColors();
    addCardBorderColors();
    toggleDarkMode();
});
