document.addEventListener('DOMContentLoaded', () => {
    // Initialize password checker
    const passwordChecker = new PasswordChecker();

    // Initialize additional buttons
    const generateBtn = document.getElementById('generatePassword');
    const copyBtn = document.getElementById('copyPassword');

    // Add event listener for generate password
    generateBtn.addEventListener('click', () => {
        const generatedPassword = passwordChecker.generateStrongPassword();
        // Input is already focused by generateStrongPassword method
        passwordChecker.showNotification('Strong password generated!', 'success');
    });

    // Add event listener for copy password
    copyBtn.addEventListener('click', async () => {
        const password = passwordChecker.elements.passwordInput.value;
        if (!password) {
            passwordChecker.showNotification('No password to copy!', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(password);
            passwordChecker.showNotification('Password copied!', 'success');
        } catch (err) {
            passwordChecker.showNotification('Failed to copy password', 'error');
        }
    });
});