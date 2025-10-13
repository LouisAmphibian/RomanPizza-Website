// Example script for arrow navigation (you can expand this later)
document.querySelectorAll('.arrow').forEach(arrow => {
  arrow.addEventListener('click', () => {
    alert('Promo navigation clicked!');
  });
});

// Navigate to menu page
document.querySelectorAll('.order-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = "menu.html";
  });
});


document.addEventListener("DOMContentLoaded", () => {
    // Navigate from landing page/menu page to the specials selection
    // Assumes buttons with the class 'promo-card' or 'order-btn' lead to specials
    const orderButtons = document.querySelectorAll('.promo-card, .order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior if it's an anchor
            window.location.href = "specials.html";
        });
    });

    // Example of how you might handle adding to combo
    // This is for demonstration; full cart logic would be more complex
    const addToComboButtons = document.querySelectorAll('.add-to-combo-btn');
    addToComboButtons.forEach(button => {
        button.addEventListener('click', () => {
            // In a real app, you would add the item to a cart object
            // For now, it just gives user feedback.
            button.textContent = 'ADDED!';
            button.style.backgroundColor = '#28a745'; // Green color
            
            // Navigate to cart after a short delay
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1000);
        });
    });

});