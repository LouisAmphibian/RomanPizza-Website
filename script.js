// script.js

document.addEventListener("DOMContentLoaded", function() {
    // Example script for arrow navigation
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            alert('Promo navigation clicked!');
        });
    });

    // Navigate to cart
    document.querySelectorAll('.cart-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "cart.html";
        });
    });

    // Navigate back to home page
    document.querySelectorAll('.logo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "index.html";
        });
    });

    // **Different navigation based on which page we're on**
    
    // If we're on index.html (home page), ORDER NOW goes to menu.html
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
        
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Navigating to menu page');
                window.location.href = "menu.html";
            });
        });
    }
    
    // If we're on menu.html, ORDER NOW goes to specials.html
    else if (window.location.pathname.includes('menu.html')) {
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Navigating to specials page');
                window.location.href = "specials.html";
            });
        });

        // Also handle promo cards on menu page
        document.querySelectorAll('.promo-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Promo card clicked, going to specials');
                window.location.href = "specials.html";
            });
        });
    }

    // If we're on specials.html, handle add to combo buttons
    else if (window.location.pathname.includes('specials.html')) {
        document.querySelectorAll('.add-to-combo-btn').forEach(button => {
            button.addEventListener('click', function() {
                // In a real app, you would add the item to a cart object
                button.textContent = 'ADDED!';
                button.style.backgroundColor = '#28a745'; // Green color
                
                // Navigate to cart after a short delay
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 1000);
            });
        });
    }

    // Menu buttons functionality (category switching)
    const menuButtons = document.querySelectorAll('.menu-btn');
    if (menuButtons.length > 0) {
        menuButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                menuButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Here you would typically show/hide different menu sections
                const category = this.textContent.toLowerCase();
                console.log('Switching to category:', category);
            });
        });
    }
});