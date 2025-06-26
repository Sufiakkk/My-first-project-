// This script runs when the page loads

// Get the paragraph element by its ID
const randomMessageElement = document.getElementById('random-message');

// Define an array of random messages
const messages = [
    "Exploring the digital frontier one line of code at a time.",
    "Every bug is a feature waiting to be discovered... or fixed!",
    "The journey of a thousand lines begins with a single commit.",
    "Creativity, logic, and a dash of debugging magic.",
    "Welcome to a small corner of the internet where ideas come to life.",
    "May your code be clean and your errors few."
];

// Generate a random index to pick a message
const randomIndex = Math.floor(Math.random() * messages.length);

// Update the text content of the paragraph
if (randomMessageElement) {
    randomMessageElement.textContent = messages[randomIndex];
    console.log("Random message updated:", messages[randomIndex]);
} else {
    console.error("Element with ID 'random-message' not found.");
}

// You can add more interactive JavaScript here later if you wish.
// For example, an event listener on the button if you wanted to do something *before* navigating.
