/**
 * PasswordChecker class handles all password strength checking functionality
 */
class PasswordChecker {
    constructor() {
        // Password requirements with regex patterns
        this.requirements = {
            length: {
                regex: /.{8,}/,
                order: 1,
                element: document.getElementById('length')
            },
            uppercase: {
                regex: /[A-Z]/,
                order: 2,
                element: document.getElementById('uppercase')
            },
            lowercase: {
                regex: /[a-z]/,
                order: 3,
                element: document.getElementById('lowercase')
            },
            number: {
                regex: /[0-9]/,
                order: 4,
                element: document.getElementById('number')
            },
            special: {
                regex: /[!@#$%^&*(),.?":{}|<>]/,
                order: 5,
                element: document.getElementById('special')
            }
        };

        // Strength levels configuration
        this.strengthLevels = [
            { score: 0, label: 'Too Weak', color: '#ff4444' },
            { score: 2, label: 'Weak', color: '#ffbb33' },
            { score: 3, label: 'Medium', color: '#00C851' },
            { score: 4, label: 'Strong', color: '#007E33' },
            { score: 5, label: 'Very Strong', color: '#003311' }
        ];

        // Initialize UI elements
        this.initializeElements();
    }

    /**
     * Initialize UI element references
     */
    initializeElements() {
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

    /**
     * Bind necessary event listeners
     */
    bindEvents() {
        this.elements.passwordInput.addEventListener('input', () => {
            this.checkPassword(this.elements.passwordInput.value);
        });

        this.elements.toggleButton.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });
    }

    /**
     * Check password strength and update UI
     * @param {string} password - Password to check
     */
    checkPassword(password) {
        const result = this.calculateStrength(password);
        this.updateUI(result);
        this.updateSuggestions(result.failedRequirements);
    }

    /**
     * Calculate password strength and check requirements
     * @param {string} password - Password to analyze
     * @returns {Object} Strength calculation results
     */
    calculateStrength(password) {
        let score = 0;
        const failedRequirements = [];
        const passedRequirements = [];

        // Check each requirement
        for (const [name, requirement] of Object.entries(this.requirements)) {
            if (requirement.regex.test(password)) {
                score++;
                passedRequirements.push(name);
            } else {
                failedRequirements.push(name);
            }
        }

        // Get strength level based on score
        const strength = this.getStrengthLevel(score);

        return {
            score,
            strength,
            failedRequirements,
            passedRequirements
        };
    }

    /**
     * Get strength level based on score
     * @param {number} score - Password strength score
     * @returns {Object} Strength level configuration
     */
    getStrengthLevel(score) {
        return this.strengthLevels.find((level, index, array) => 
            score >= level.score && 
            (index === array.length - 1 || score < array[index + 1].score)
        );
    }

    /**
     * Update UI elements with strength results
     * @param {Object} result - Strength calculation results
     */
    updateUI(result) {
        // Update strength bar
        const percentage = (result.score / Object.keys(this.requirements).length) * 100;
        this.elements.strengthBar.style.width = `${percentage}%`;
        this.elements.strengthBar.style.backgroundColor = result.strength.color;

        // Update strength text
        this.elements.strengthText.textContent = result.strength.label;
        this.elements.strengthText.style.color = result.strength.color;

        // Update requirement indicators
        this.updateRequirements(result.passedRequirements, result.failedRequirements);
    }

    /**
     * Update requirement indicators
     * @param {Array} passed - Passed requirements
     * @param {Array} failed - Failed requirements
     */
    updateRequirements(passed, failed) {
        passed.forEach(req => {
            const element = this.requirements[req].element;
            element.classList.remove('invalid');
            element.classList.add('valid');
            element.querySelector('i').classList.replace('fa-circle-xmark', 'fa-circle-check');
        });

        failed.forEach(req => {
            const element = this.requirements[req].element;
            element.classList.remove('valid');
            element.classList.add('invalid');
            element.querySelector('i').classList.replace('fa-circle-check', 'fa-circle-xmark');
        });
    }

    /**
     * Generate and update suggestions based on failed requirements
     * @param {Array} failedRequirements - List of failed requirements
     */
    updateSuggestions(failedRequirements) {
        if (failedRequirements.length === 0) {
            this.elements.suggestionsDiv.querySelector('.suggestions-content').innerHTML = `
                <p class="success-message">Great job! Your password meets all requirements.</p>
            `;
            return;
        }

        const suggestions = this.generateSuggestions(failedRequirements);
        this.elements.suggestionsDiv.querySelector('.suggestions-content').innerHTML = `
            <ul class="suggestions-list">
                ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        `;
    }

    /**
     * Generate suggestion messages for failed requirements
     * @param {Array} failedRequirements - List of failed requirements
     * @returns {Array} List of suggestion messages
     */
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

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility() {
        const type = this.elements.passwordInput.type === 'password' ? 'text' : 'password';
        this.elements.passwordInput.type = type;
        
        const icon = this.elements.toggleButton.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }
}