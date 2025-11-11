

const API_BASE_URL = 'https://your-api-domain.com/api'; // Replace with your deployed API URL

class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('userData') || 'null');
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async signup(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: this.token })
            });

            const data = await response.json();

            if (data.valid) {
                this.user = data.user;
                localStorage.setItem('userData', JSON.stringify(data.user));
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }
}

// Initialize Auth Service
const authService = new AuthService();

// DOM Elements
const loginOpenBtn = document.querySelector("#form-open-login");
const signupOpenBtn = document.querySelector("#form-open-signup");
const body = document.body;
const formContainer = document.querySelector(".form_container");
const formCloseBtn = document.querySelector(".form_close");
const goToSignupLink = document.querySelector("#go-signup");
const goToLoginLink = document.querySelector("#go-login");
const pwShowHide = document.querySelectorAll(".pw_hide");
const signInForm = document.querySelector('.login_form form');
const signUpForm = document.querySelector('.signup_form form');

// Password Show/Hide Functionality
pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
        let getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.textContent = "🙈";
        } else {
            getPwInput.type = "password";
            icon.textContent = "👁️"; 
        }
    });
});

// Form Toggling Functions
if (loginOpenBtn) {
    loginOpenBtn.addEventListener("click", () => {
        body.classList.add("show-form", "show-login");
        body.classList.remove("show-signup");
    });
}

if (signupOpenBtn) {
    signupOpenBtn.addEventListener("click", () => {
        body.classList.add("show-form", "show-signup");
        body.classList.remove("show-login");
    });
}

if (formCloseBtn) {
    formCloseBtn.addEventListener("click", () => {
        body.classList.remove("show-form", "show-login", "show-signup");
    });
}

if (goToSignupLink) {
    goToSignupLink.addEventListener("click", (e) => {
        e.preventDefault();
        body.classList.add("show-signup");
        body.classList.remove("show-login");
    });
}

if (goToLoginLink) {
    goToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        body.classList.add("show-login");
        body.classList.remove("show-signup");
    });
}

// Form Submission Handlers
if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signInForm);
        const email = formData.get('email');
        const password = formData.get('password');

        const submitButton = signInForm.querySelector('.button');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Signing In...';
        submitButton.disabled = true;

        const result = await authService.login(email, password);

        if (result.success) {
            // Close form
            body.classList.remove("show-form", "show-login", "show-signup");
            
            // Update UI
            updateHeaderForLoggedInUser(result.user.displayName);
            
            // Clear form
            signInForm.reset();
            
            showNotification('Login successful!', 'success');
        } else {
            showNotification(result.error || 'Login failed!', 'error');
        }

        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
}

if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signUpForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Client-side validation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters!', 'error');
            return;
        }

        const submitButton = signUpForm.querySelector('.button');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;

        const result = await authService.signup(name, email, password);

        if (result.success) {
            // Close form
            body.classList.remove("show-form", "show-login", "show-signup");
            
            // Update UI
            updateHeaderForLoggedInUser(result.user.displayName);
            
            // Clear form
            signUpForm.reset();
            
            showNotification('Account created successfully!', 'success');
        } else {
            showNotification(result.error || 'Signup failed!', 'error');
        }

        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
}

// UI Update Functions
function updateHeaderForLoggedInUser(displayName) {
    const loginBtn = document.querySelector("#form-open-login");
    const signupBtn = document.querySelector("#form-open-signup");
    const navButtons = document.querySelector(".nav-buttons");

    // Remove login button
    if (loginBtn) {
        loginBtn.remove();
    }

    // Update signup button to logout
    if (signupBtn) {
        signupBtn.textContent = 'LOGOUT';
        signupBtn.id = 'logout-btn';
        signupBtn.classList.remove('signup-btn');
        signupBtn.classList.add('logout-btn');
        
        // Remove existing click listeners by cloning and replacing
        const newSignupBtn = signupBtn.cloneNode(true);
        signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
        
        // Add logout functionality to the new button
        newSignupBtn.addEventListener('click', handleLogout);
    }

    // Create user display element
    const userDisplay = document.createElement('span');
    userDisplay.className = 'user-display';
    userDisplay.textContent = displayName;
    userDisplay.style.cssText = `
        color: #fff;
        font-weight: 600;
        padding: 8px 20px;
        background-color: #e60000;
        border-radius: 25px;
        margin-right: 10px;
        font-size: 14px;
    `;

    // Insert user display before logout button
    if (navButtons) {
        navButtons.insertBefore(userDisplay, navButtons.querySelector('#logout-btn'));
    }
}

function handleLogout() {
    authService.logout();
    showNotification('Logged out successfully!', 'success');
    
    // Refresh page to reset UI completely
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Add CSS animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Initialize app on load
document.addEventListener("DOMContentLoaded", function() {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        authService.verifyToken().then(isValid => {
            if (isValid && authService.user) {
                updateHeaderForLoggedInUser(authService.user.displayName);
            }
        });
    }

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

    // Handle coupon button
    const couponBtn = document.querySelector('.coupon-btn');
    if (couponBtn) {
        couponBtn.addEventListener('click', function() {
            if (authService.isAuthenticated()) {
                showNotification('Coupon applied successfully!', 'success');
            } else {
                showNotification('Please login to get your coupon!', 'error');
                // Optionally open login form
                body.classList.add("show-form", "show-login");
            }
        });
    }
});

// Error handling for fetch requests
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('A network error occurred. Please check your connection.', 'error');
});

// Export for testing purposes (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService };
}

// Simple navigation functionality
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. ORDER NOW button - navigate to menu.html
    const orderNowBtn = document.querySelector("#order-now");
    if (orderNowBtn) {
        orderNowBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log('Navigating to menu page');
            window.location.href = "menu.html";
        });
    }

    // 2. Cart icon - navigate to cart.html
    const cartIcon = document.querySelector(".cart-icon");
    if (cartIcon) {
        cartIcon.addEventListener("click", (e) => {
            e.preventDefault();
            console.log('Navigating to cart page');
            window.location.href = "cart.html";
        });
    }

    // Optional: Add click handlers for other navigation if needed
    const findStoreBtn = document.querySelector("#find-store");
    if (findStoreBtn) {
        findStoreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            alert('Find a store feature would open here');
        });
    }

    console.log("Navigation handlers attached successfully");
});