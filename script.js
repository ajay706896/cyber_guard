document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const passwordInput = document.getElementById('password-input');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const scoreValue = document.getElementById('score-value');
    const suggestionsList = document.getElementById('suggestions-list');
    
    // Suggestion Check Items
    const checks = {
        length: document.getElementById('length-check'),
        upper: document.getElementById('upper-check'),
        lower: document.getElementById('lower-check'),
        number: document.getElementById('number-check'),
        symbol: document.getElementById('symbol-check'),
        length12: document.getElementById('length-check-12')
    };

    // Generator Elements
    const generateBtn = document.getElementById('generate-btn');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const upperToggle = document.getElementById('upper-toggle');
    const lowerToggle = document.getElementById('lower-toggle');
    const numberToggle = document.getElementById('number-toggle');
    const symbolToggle = document.getElementById('symbol-toggle');

    // Icon Elements
    const copyIcon = document.getElementById('copy-icon');
    const toggleVisibility = document.getElementById('toggle-visibility');

    // Alert Modal
    const alertModal = document.getElementById('alert-modal');

    // --- Main Event Listener ---
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password.length === 0) {
            resetUI();
            return;
        }
        const strength = calculatePasswordStrength(password);
        updateUI(strength);
    });

    /**
     * Resets the UI to its initial state.
     */
    function resetUI() {
        strengthBar.style.width = '0%';
        strengthBar.className = '';
        strengthText.textContent = 'Enter a password';
        scoreValue.textContent = '0';
        
        Object.values(checks).forEach(check => {
            updateSuggestionItem(check, false);
        });
    }

    /**
     * Calculates the strength of a given password.
     * @param {string} password - The password to analyze.
     * @returns {object} An object containing the score and criteria met.
     */
    function calculatePasswordStrength(password) {
        let score = 0;
        const criteria = {
            hasLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSymbol: /[^A-Za-z0-9]/.test(password),
            hasLength12: password.length >= 12,
        };

        // Score based on length (max 40 points)
        score += Math.min(password.length * 3.4, 40);

        // Score based on character variety (15 points each)
        if (criteria.hasUpper) score += 15;
        if (criteria.hasLower) score += 15;
        if (criteria.hasNumber) score += 15;
        if (criteria.hasSymbol) score += 15;
        
        // Ensure score caps at 100
        score = Math.min(Math.round(score), 100);

        return { score, criteria };
    }

    /**
     * Updates the UI based on the calculated strength.
     * @param {object} strength - The strength object from calculatePasswordStrength.
     */
    function updateUI(strength) {
        const { score, criteria } = strength;
        
        // 1. Update Score
        scoreValue.textContent = score;

        // 2. Update Strength Bar
        strengthBar.style.width = score + '%';
        strengthBar.className = ''; // Clear old classes
        
        let strengthCategory = '';
        let strengthLabel = '';

        if (score < 30) {
            strengthCategory = 'strength-bar-weak';
            strengthLabel = 'Weak';
        } else if (score < 60) {
            strengthCategory = 'strength-bar-medium';
            strengthLabel = 'Medium';
        } else if (score < 90) {
            strengthCategory = 'strength-bar-strong';
            strengthLabel = 'Strong';
        } else {
            strengthCategory = 'strength-bar-very-strong';
            strengthLabel = 'Very Strong';
        }
        
        strengthBar.classList.add(strengthCategory);
        strengthText.textContent = strengthLabel;

        // 3. Update Suggestion List
        updateSuggestionItem(checks.length, criteria.hasLength);
        updateSuggestionItem(checks.upper, criteria.hasUpper);
        updateSuggestionItem(checks.lower, criteria.hasLower);
        updateSuggestionItem(checks.number, criteria.hasNumber);
        updateSuggestionItem(checks.symbol, criteria.hasSymbol);
        updateSuggestionItem(checks.length12, criteria.hasLength12);
    }

    /**
     * Updates a single suggestion item (icon and text class).
     * @param {HTMLElement} item - The <li> element.
     * @param {boolean} isMet - Whether the criterion is met.
     */
    function updateSuggestionItem(item, isMet) {
        const icon = item.querySelector('i');
        if (isMet) {
            icon.className = 'fas fa-check-circle';
            item.classList.add('met');
        } else {
            icon.className = 'fas fa-times-circle';
            item.classList.remove('met');
        }
    }

    // --- Password Generator Logic ---
    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
    });

    generateBtn.addEventListener('click', () => {
        const length = parseInt(lengthSlider.value, 10);
        const includeUpper = upperToggle.checked;
        const includeLower = lowerToggle.checked;
        const includeNumber = numberToggle.checked;
        const includeSymbol = symbolToggle.checked;

        const newPassword = generatePassword(length, includeUpper, includeLower, includeNumber, includeSymbol);
        
        passwordInput.value = newPassword;
        passwordInput.dispatchEvent(new Event('input')); // Trigger strength check
    });

    /**
     * Generates a random password based on selected criteria.
     */
    function generatePassword(length, upper, lower, number, symbol) {
        const charsets = {
            lower: 'abcdefghijklmnopqrstuvwxyz',
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            number: '0123456789',
            symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
        };

        let availableChars = '';
        let password = '';
        
        // Build available character pool
        if (upper) availableChars += charsets.upper;
        if (lower) availableChars += charsets.lower;
        if (number) availableChars += charsets.number;
        if (symbol) availableChars += charsets.symbol;

        if (availableChars.length === 0) {
            showCustomAlert("Please select at least one character set.", true);
            return ''; // No character sets selected
        }
        
        // Ensure at least one of each selected type
        if (upper) password += charsets.upper[Math.floor(Math.random() * charsets.upper.length)];
        if (lower) password += charsets.lower[Math.floor(Math.random() * charsets.lower.length)];
        if (number) password += charsets.number[Math.floor(Math.random() * charsets.number.length)];
        if (symbol) password += charsets.symbol[Math.floor(Math.random() * charsets.symbol.length)];

        // Fill remaining length
        for (let i = password.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * availableChars.length);
            password += availableChars[randomIndex];
        }

        // Shuffle the password to avoid predictable start
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    // --- Utility Functions: Copy & Toggle Visibility ---
    copyIcon.addEventListener('click', () => {
        const password = passwordInput.value;
        if (!password) return;

        // Use 'document.execCommand' as a fallback for iFrame sandboxes
        try {
            const ta = document.createElement('textarea');
            ta.value = password;
            ta.style.position = 'fixed'; // Prevent scrolling
            ta.style.opacity = 0;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showCustomAlert('Password copied to clipboard!');
        } catch (err) {
            showCustomAlert('Failed to copy password.', true);
        }
    });

    toggleVisibility.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleVisibility.className = 'fas fa-eye-slash input-icon';
            toggleVisibility.title = 'Hide Password';
        } else {
            passwordInput.type = 'password';
            toggleVisibility.className = 'fas fa-eye input-icon';
            toggleVisibility.title = 'Show Password';
        }
    });

    /**
     * Displays a custom alert message.
     * @param {string} message - The text to display.
     * @param {boolean} [isError=false] - If true, shows error styling.
     */
    function showCustomAlert(message, isError = false) {
        alertModal.textContent = message;
        alertModal.style.backgroundColor = isError ? 'var(--color-weak)' : '#fff';
        alertModal.style.color = isError ? '#fff' : 'var(--color-bg)';
        alertModal.classList.add('show');
        
        setTimeout(() => {
            alertModal.classList.remove('show');
        }, 2500);
    }

    // --- Init ---
    resetUI(); // Set initial state for suggestions
});
