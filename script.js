class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('userData') || 'null');
    }

    async login(email, password) {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get users from local database
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.token = 'local-token-' + Date.now();
                this.user = { 
                    displayName: user.name, 
                    email: user.email,
                    id: user.id
                };
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('userData', JSON.stringify(this.user));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    async signup(name, email, password) {
        try {
            // Validate password strength
            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.isValid) {
                return { success: false, error: passwordValidation.error };
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get existing users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                return { success: false, error: 'User already exists with this email' };
            }
            
            // Validate email format
            if (!this.validateEmail(email)) {
                return { success: false, error: 'Please enter a valid email address' };
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            this.token = 'local-token-' + Date.now();
            this.user = { 
                displayName: name, 
                email: email,
                id: newUser.id
            };
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('userData', JSON.stringify(this.user));
            
            return { success: true, user: this.user };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Signup failed. Please try again.' };
        }
    }

    validatePassword(password) {
        const requirements = {
            minLength: 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        const errors = [];

        if (password.length < requirements.minLength) {
            errors.push(`at least ${requirements.minLength} characters`);
        }
        if (!requirements.hasUpperCase) {
            errors.push('one uppercase letter (A-Z)');
        }
        if (!requirements.hasLowerCase) {
            errors.push('one lowercase letter (a-z)');
        }
        if (!requirements.hasNumbers) {
            errors.push('one number (0-9)');
        }
        if (!requirements.hasSpecialChar) {
            errors.push('one special character (!@#$%^&*)');
        }

        if (errors.length > 0) {
            return {
                isValid: false,
                error: `Password must contain: ${errors.join(', ')}`,
                requirements: requirements
            };
        }

        return {
            isValid: true,
            requirements: requirements
        };
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getPasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Character type checks
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
        
        return {
            score: strength,
            level: strength >= 6 ? 'strong' : strength >= 4 ? 'medium' : 'weak',
            maxScore: 6
        };
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            // Check if token exists in localStorage
            const storedToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');
            
            if (storedToken === this.token && userData) {
                this.user = JSON.parse(userData);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.logout();
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

    // Helper method to initialize sample data
    initializeSampleData() {
        if (!localStorage.getItem('users')) {
            const sampleUsers = [
                {
                    id: '1',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: 'Password123!',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
        }
    }
}

// Initialize Auth Service
const authService = new AuthService();
authService.initializeSampleData();

// DOM Elements
const loginOpenBtn = document.querySelector("#form-open-login");
const signupOpenBtn = document.querySelector("#form-open-signup");
const body = document.body;
const formCloseBtn = document.querySelector(".form_close");
const goToSignupLink = document.querySelector("#go-signup");
const goToLoginLink = document.querySelector("#go-login");
const pwShowHide = document.querySelectorAll(".pw_hide");
const signInForm = document.querySelector('.login_form form');
const signUpForm = document.querySelector('.signup_form form');

// Password strength indicator elements
let passwordStrengthIndicator = null;
let passwordRequirementsList = null;

// Initialize password strength UI
function initializePasswordStrengthUI() {
    if (signUpForm) {
        const passwordInput = signUpForm.querySelector('input[type="password"]');
        if (passwordInput) {
            // Create password strength indicator
            passwordStrengthIndicator = document.createElement('div');
            passwordStrengthIndicator.className = 'password-strength';
            passwordStrengthIndicator.style.cssText = `
                margin-top: 5px;
                font-size: 12px;
                transition: all 0.3s ease;
            `;
            
            // Create requirements list
            passwordRequirementsList = document.createElement('div');
            passwordRequirementsList.className = 'password-requirements';
            passwordRequirementsList.style.cssText = `
                margin-top: 10px;
                font-size: 11px;
                color: #666;
                display: none;
            `;
            
            passwordInput.parentNode.appendChild(passwordStrengthIndicator);
            passwordInput.parentNode.appendChild(passwordRequirementsList);
            
            // Add real-time password strength checking
            passwordInput.addEventListener('input', updatePasswordStrength);
            passwordInput.addEventListener('focus', showPasswordRequirements);
            passwordInput.addEventListener('blur', hidePasswordRequirements);
        }
    }
}

function updatePasswordStrength(e) {
    const password = e.target.value;
    const strength = authService.getPasswordStrength(password);
    
    let strengthText = '';
    let strengthColor = '';
    
    switch (strength.level) {
        case 'weak':
            strengthText = 'Weak Password';
            strengthColor = '#ff4444';
            break;
        case 'medium':
            strengthText = 'Medium Password';
            strengthColor = '#ffaa00';
            break;
        case 'strong':
            strengthText = 'Strong Password';
            strengthColor = '#00c851';
            break;
    }
    
    passwordStrengthIndicator.textContent = strengthText;
    passwordStrengthIndicator.style.color = strengthColor;
    passwordStrengthIndicator.style.fontWeight = '600';
}

function showPasswordRequirements() {
    const requirements = [
        'At least 8 characters long',
        'One uppercase letter (A-Z)',
        'One lowercase letter (a-z)',
        'One number (0-9)',
        'One special character (!@#$%^&*)'
    ];
    
    passwordRequirementsList.innerHTML = requirements.map(req => 
        `<div style="margin: 2px 0;">• ${req}</div>`
    ).join('');
    passwordRequirementsList.style.display = 'block';
}

function hidePasswordRequirements() {
    // Only hide if password field is empty
    const passwordInput = signUpForm.querySelector('input[type="password"]');
    if (passwordInput.value === '') {
        passwordRequirementsList.style.display = 'none';
    }
}

// Password Show/Hide Functionality
pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
        let getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.classList.replace("uil-eye-slash", "uil-eye");
        } else {
            getPwInput.type = "password";
            icon.classList.replace("uil-eye", "uil-eye-slash");
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
        
        const email = signInForm.querySelector('input[type="email"]').value;
        const password = signInForm.querySelector('input[type="password"]').value;

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
        
        const name = signUpForm.querySelector('input[placeholder="Enter your name"]').value;
        const email = signUpForm.querySelector('input[type="email"]').value;
        const password = signUpForm.querySelector('input[type="password"]').value;
        const confirmPassword = signUpForm.querySelectorAll('input[type="password"]')[1].value;

        // Client-side validation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        // Validate email format
        if (!authService.validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
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
        loginBtn.style.display = 'none';
    }

    // Update signup button to logout
    if (signupBtn) {
        signupBtn.textContent = 'LOGOUT';
        signupBtn.id = 'logout-btn';
        signupBtn.classList.remove('signup-btn');
        signupBtn.classList.add('logout-btn');
        
        // Remove existing click listeners
        const newSignupBtn = signupBtn.cloneNode(true);
        signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
        
        // Add logout functionality
        newSignupBtn.addEventListener('click', handleLogout);
    }

    // Create user display element
    const userDisplay = document.createElement('span');
    userDisplay.className = 'user-display';
    userDisplay.textContent = `Hi, ${displayName}`;
    userDisplay.style.cssText = `
        color: #fff;
        font-weight: 600;
        padding: 8px 16px;
        background-color: #e60000;
        border-radius: 20px;
        margin-right: 10px;
        font-size: 14px;
    `;

    // Insert user display before logout button
    if (navButtons) {
        const logoutBtn = navButtons.querySelector('#logout-btn');
        if (logoutBtn) {
            navButtons.insertBefore(userDisplay, logoutBtn);
        }
    }
}

function handleLogout() {
    authService.logout();
    showNotification('Logged out successfully!', 'success');
    
    // Refresh page to reset UI
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

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Initialize app on load
document.addEventListener("DOMContentLoaded", function() {
    // Initialize password strength UI
    initializePasswordStrengthUI();
    
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        authService.verifyToken().then(isValid => {
            if (isValid && authService.user) {
                updateHeaderForLoggedInUser(authService.user.displayName);
            }
        });
    }

    // Navigation handlers
    const orderNowBtn = document.querySelector("#order-now");
    if (orderNowBtn) {
        orderNowBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "menu.html";
        });
    }

    const cartIcon = document.querySelector(".cart-icon");
    if (cartIcon) {
        cartIcon.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "cart.html";
        });
    }

    const findStoreBtn = document.querySelector("#find-store");
    if (findStoreBtn) {
        findStoreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            alert('Find a store feature would open here');
        });
    }

    const deliveryBtn = document.querySelector("#delivery");
    if (deliveryBtn) {
        deliveryBtn.addEventListener("click", (e) => {
            e.preventDefault();
            alert('Delivery information would show here');
        });
    }

    const specialImg = document.querySelector("#specialOnly");
    if(specialImg){
        specialImg.addEventListener("click", (e)=> {
            e.preventDefault();
            window.location.href = "specials.html";
        });
    }

    /*
    const specialBtn =document.querySelector('#specials');
    if(specialBtn){
        specialBtn.addEventListener("click", (e)=>{
            e.preventDefault();
            window.location.href = "specials.html"
        });
    }*/

    // Logo click - go to home
    document.querySelectorAll('.logo').forEach(logo => {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "index.html";
        });
    });

    console.log("Auth system with password validation initialized successfully");
});