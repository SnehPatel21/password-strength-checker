/**
 * PasswordChecker class handles all password strength checking functionality
 */
class PasswordChecker {
    constructor() {
        // Password requirements with regex patterns
        this.requirements = {
            length: {
                regex: /.{8,}/,
                element: document.getElementById('length')
            },
            uppercase: {
                regex: /[A-Z]/,
                element: document.getElementById('uppercase')
            },
            lowercase: {
                regex: /[a-z]/,
                element: document.getElementById('lowercase')
            },
            number: {
                regex: /[0-9]/,
                element: document.getElementById('number')
            },
            special: {
                regex: /[!@#$%^&*(),.?":{}|<>]/,
                element: document.getElementById('special')
            }
        };

        // Initialize UI elements
        this.elements = {
            passwordInput: document.getElementById('passwordInput'),
            strengthBar: document.getElementById('strengthBar'),
            strengthText: document.getElementById('strengthText'),
            toggleButton: document.getElementById('togglePassword'),
            suggestionsDiv: document.getElementById('suggestions')
        };

        // Bind event listeners
        this.bindEvents();
    }

    bindEvents() {
        // Password input event
        this.elements.passwordInput.addEventListener('input', () => {
            this.checkPassword(this.elements.passwordInput.value);
        });

        // Toggle password visibility
        this.elements.toggleButton.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + / to generate password
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.generateStrongPassword(); // This now handles focus
            this.showNotification('Password generated!', 'success');
        }

        // Ctrl/Cmd + C to copy password when input is focused
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
            document.activeElement === this.elements.passwordInput) {
            const password = this.elements.passwordInput.value;
            if (password && !window.getSelection().toString()) {
                e.preventDefault();
                navigator.clipboard.writeText(password)
                    .then(() => this.showNotification('Password copied!', 'success'))
                    .catch(() => this.showNotification('Failed to copy password', 'error'));
            }
        }
    });

    }

generateStrongPassword(length = 16) {
    const charset = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let password = '';

    // Ensure at least one character from each set
    password += this.getRandomChar(charset.uppercase);
    password += this.getRandomChar(charset.lowercase);
    password += this.getRandomChar(charset.numbers);
    password += this.getRandomChar(charset.symbols);

    // Fill the rest randomly
    const allChars = Object.values(charset).join('');
    for (let i = password.length; i < length; i++) {
        password += this.getRandomChar(allChars);
    }

    // Shuffle the password
    const finalPassword = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Update input and focus it
    this.elements.passwordInput.value = finalPassword;
    this.elements.passwordInput.focus();
    this.checkPassword(finalPassword);
    
    return finalPassword;
}

    getRandomChar(charset) {
        return charset[Math.floor(Math.random() * charset.length)];
    }

    checkPassword(password) {
        let score = 0;
        const failedRequirements = [];

        // Check each requirement
        for (const [name, req] of Object.entries(this.requirements)) {
            if (req.regex.test(password)) {
                score++;
                this.updateRequirement(req.element, true);
            } else {
                failedRequirements.push(name);
                this.updateRequirement(req.element, false);
            }
        }

        // Update UI
        this.updateStrengthIndicator(score, failedRequirements);
    }

    updateStrengthIndicator(score, failedRequirements) {
        const strength = this.getStrengthLevel(score);
        
        // Update strength bar
        const percentage = (score / Object.keys(this.requirements).length) * 100;
        this.elements.strengthBar.style.width = `${percentage}%`;
        this.elements.strengthBar.style.backgroundColor = strength.color;
        
        // Update strength text
        this.elements.strengthText.textContent = strength.label;
        
        // Update suggestions
        this.updateSuggestions(failedRequirements);
    }

    getStrengthLevel(score) {
        if (score === 0) return { label: 'Too Weak', color: '#ff4444' };
        if (score <= 2) return { label: 'Weak', color: '#ffbb33' };
        if (score <= 3) return { label: 'Medium', color: '#00C851' };
        if (score <= 4) return { label: 'Strong', color: '#007E33' };
        return { label: 'Very Strong', color: '#003311' };
    }

    updateRequirement(element, valid) {
        const icon = element.querySelector('i');
        if (valid) {
            element.classList.add('valid');
            element.classList.remove('invalid');
            icon.classList.replace('fa-circle-xmark', 'fa-circle-check');
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
            icon.classList.replace('fa-circle-check', 'fa-circle-xmark');
        }
    }

    togglePasswordVisibility() {
        const type = this.elements.passwordInput.type === 'password' ? 'text' : 'password';
        this.elements.passwordInput.type = type;
        
        const icon = this.elements.toggleButton.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateSuggestions(failedRequirements) {
        const suggestionsContent = this.elements.suggestionsDiv.querySelector('.suggestions-content');
        
        if (failedRequirements.length === 0) {
            suggestionsContent.innerHTML = `
                <p class="success-message">Great job! Your password meets all requirements.</p>
            `;
            return;
        }

        const suggestions = this.generateSuggestions(failedRequirements);
        suggestionsContent.innerHTML = `
            <ul class="suggestions-list">
                ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        `;
    }

    generateSuggestions(failedRequirements) {
        const suggestionMessages = {
            length: 'Make your password at least 8 characters long',
            uppercase: 'Add an uppercase letter (A-Z)',
            lowercase: 'Add a lowercase letter (a-z)',
            number: 'Include at least one number (0-9)',
            special: 'Add a special character (!@#$%^&*)'
        };

        return failedRequirements.map(req => suggestionMessages[req]);
    }
}