// Button interaction logic for the anniversary page

// Global variables
let noClickCount = 0;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Elements
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const container = document.getElementById("promptContainer");
const pacman = document.getElementById("pacman");
const successMessage = document.getElementById("successMessage");

// Position buttons initially
function positionButtons() {
    const containerRect = container.getBoundingClientRect();
    const btnWidth = 80; // Approximate button width
    const btnHeight = 40; // Approximate button height
    const margin = 20;
    const promptHeight = 50; // Approximate height of the prompt text

    // Position Yes button below the prompt, left side
    yesBtn.style.left = margin + "px";
    yesBtn.style.top = (promptHeight + margin) + "px";

    // Position No button below the prompt, right side
    noBtn.style.left = (containerRect.width - btnWidth - margin) + "px";
    noBtn.style.top = (promptHeight + margin) + "px";
}

// Observe when promptContainer is shown to position buttons
const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (container.style.display !== 'none') {
                setTimeout(positionButtons, 100); // Delay to ensure container is rendered
            }
        }
    });
});
observer.observe(container, { attributes: true, attributeFilter: ['style'] });

// Yes button click handler
yesBtn.addEventListener("click", function () {
    container.style.display = "none";
    successMessage.style.display = "block";
    // Stop any remaining slideshow intervals
    if (window.showImageInterval) clearInterval(window.showImageInterval);
    if (window.imgInterval) clearInterval(window.imgInterval);
    if (window.buttonInterval) clearInterval(window.buttonInterval);
    // Reset No click count for next time
    noClickCount = 0;
    yesBtn.style.transform = "scale(1)"; // Reset scale
});

// No button click handler
noBtn.addEventListener("click", function () {
    if (isMobile) {
        noClickCount++;
        const currentScale = parseFloat(yesBtn.style.transform.replace('scale(', '').replace(')', '')) || 1;
        // Make yes button grow much bigger each time (20% increase)
        yesBtn.style.transform = "scale(" + (currentScale * 1.2) + ")";

        if (noClickCount >= 5) {
            // Show Pac-Man animation
            showPacmanAnimation();
        }
        // Removed alert notification
    } else {
        // Removed alert notification
    }
});

// Function to show Pac-Man stealing the No button
function showPacmanAnimation() {
    const noBtnRect = noBtn.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    // Start Pac-Man from the right edge
    const startX = screenWidth - 200; // 200px is Pac-Man width
    const startY = noBtnRect.top;
    pacman.style.left = startX + "px";
    pacman.style.top = startY + "px";
    pacman.style.display = "block";

    // Phase 1: Move to No button
    const targetX1 = noBtnRect.left;
    const targetY1 = noBtnRect.top;
    const steps1 = 30;
    const stepX1 = (targetX1 - startX) / steps1;
    const stepY1 = (targetY1 - startY) / steps1;
    let currentStep = 0;

    const animationInterval1 = setInterval(function () {
        currentStep++;
        const pacmanX = startX + stepX1 * currentStep;
        const pacmanY = startY + stepY1 * currentStep;
        pacman.style.left = pacmanX + "px";
        pacman.style.top = pacmanY + "px";

        if (currentStep >= steps1) {
            clearInterval(animationInterval1);
            // Hide No button (stolen)
            noBtn.style.display = "none";

            // Phase 2: Move back to right edge
            const targetX2 = screenWidth - 200;
            const targetY2 = noBtnRect.top;
            const steps2 = 30;
            const stepX2 = (targetX2 - targetX1) / steps2;
            const stepY2 = (targetY2 - targetY1) / steps2;
            let currentStep2 = 0;

            const animationInterval2 = setInterval(function () {
                currentStep2++;
                const pacmanX = targetX1 + stepX2 * currentStep2;
                const pacmanY = targetY1 + stepY2 * currentStep2;
                pacman.style.left = pacmanX + "px";
                pacman.style.top = pacmanY + "px";

                if (currentStep2 >= steps2) {
                    clearInterval(animationInterval2);
                    // Hide Pac-Man
                    pacman.style.display = "none";
                }
            }, 50);
        }
    }, 50);
}

// Make No button run away on desktop (not on mobile)
container.addEventListener("mousemove", function (event) {
    if (!isMobile) { // Only on desktop
        const rect = noBtn.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;
        const distance = Math.sqrt((mouseX - btnX) ** 2 + (mouseY - btnY) ** 2);
        if (distance < 100) { // If mouse is within 100px
            const containerRect = container.getBoundingClientRect();
            const btnWidth = rect.width;
            const btnHeight = rect.height;
            const yesRect = yesBtn.getBoundingClientRect();
            const safeMargin = 50; // Minimum distance from Yes button

            let attempts = 0;
            let newX, newY;
            const mouseSafeMargin = 60; // Minimum distance from mouse cursor
            const currentX = parseFloat(noBtn.style.left) || 0;
            const currentY = parseFloat(noBtn.style.top) || 0;
            do {
                // Bias towards vertical movement: smaller horizontal range, full vertical range
                newX = currentX + (Math.random() - 0.5) * 150; // Small horizontal variation
                newY = Math.random() * (containerRect.height - btnHeight); // Full vertical range
                // Clamp to container
                newX = Math.max(0, Math.min(newX, containerRect.width - btnWidth));
                newY = Math.max(0, Math.min(newY, containerRect.height - btnHeight));
                const mouseDistance = Math.sqrt((newX + btnWidth / 2 - (mouseX - containerRect.left)) ** 2 + (newY + btnHeight / 2 - (mouseY - containerRect.top)) ** 2);
                attempts++;
            } while (
                ((Math.abs(newX - (yesRect.left - containerRect.left)) < safeMargin + btnWidth &&
                    Math.abs(newY - (yesRect.top - containerRect.top)) < safeMargin + btnHeight) ||
                    mouseDistance < mouseSafeMargin) &&
                attempts < 10
            );

            noBtn.style.left = newX + "px";
            noBtn.style.top = newY + "px";
        }
    }
});
