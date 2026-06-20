
 
const StorageManager = {
    // Prefix for all storage keys
    PREFIX: 'typingGuy_',

    /**
     * Get a value from localStorage
     * @param {string} key - The key to retrieve
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} The stored value or default
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.PREFIX + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage: ${error}`);
            return defaultValue;
        }
    },

    /**
     * Set a value in localStorage
     * @param {string} key - The key to store
     * @param {*} value - The value to store
     */
    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage: ${error}`);
        }
    },

    /**
     * Remove a value from localStorage
     * @param {string} key - The key to remove
     */
    remove(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
        } catch (error) {
            console.error(`Error removing from localStorage: ${error}`);
        }
    },

    /**
     * Clear all app storage
     */
    clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error(`Error clearing localStorage: ${error}`);
        }
    },

    /**
     * Get personal best for a specific day
     * @param {number} dayId - The day ID
     * @returns {object} Personal best data
     */
    getPersonalBest(dayId) {
        return this.get(`day_${dayId}_pb`, null);
    },

    /**
     * Set personal best for a specific day
     * @param {number} dayId - The day ID
     * @param {object} stats - The stats to store
     */
    setPersonalBest(dayId, stats) {
        this.set(`day_${dayId}_pb`, stats);
    },
};

/**
 * Time Utilities
 */
const TimeUtils = {
    /**
     * Format seconds into MM:SS format
     * @param {number} seconds - Total seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Get current ISO date string
     * @returns {string} YYYY-MM-DD format
     */
    getDateString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },

    /**
     * Format a date string to readable format
     * @param {string} dateStr - ISO date string (YYYY-MM-DD)
     * @returns {string} Formatted date
     */
    formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00Z');
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
};

/**
 * Typing Utilities
 */
const TypingUtils = {
    /**
     * Calculate Words Per Minute
     * @param {number} characters - Characters typed correctly
     * @param {number} seconds - Time elapsed in seconds
     * @returns {number} WPM (rounded to 1 decimal)
     */
    calculateWPM(characters, seconds) {
        // Standard: 1 word = 5 characters
        if (seconds === 0) return 0;
        const minutes = seconds / 60;
        const words = characters / 5;
        return Math.round((words / minutes) * 10) / 10;
    },

    /**
     * Calculate typing accuracy
     * @param {number} correct - Correct characters
     * @param {number} total - Total characters typed
     * @returns {number} Accuracy percentage (0-100)
     */
    calculateAccuracy(correct, total) {
        if (total === 0) return 100;
        return Math.round((correct / total) * 100);
    },

    /**
     * Count words in text
     * @param {string} text - The text to count
     * @returns {number} Word count
     */
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Compare user input with target paragraph
     * @param {string} typed - What the user typed
     * @param {string} target - The target paragraph
     * @returns {object} Stats object
     */
    compareTyping(typed, target) {
        let correct = 0;
        let incorrect = 0;
        const length = Math.max(typed.length, target.length);

        for (let i = 0; i < length; i++) {
            if (typed[i] === target[i]) {
                correct++;
            } else {
                incorrect++;
            }
        }

        return {
            correct,
            incorrect,
            total: correct + incorrect,
        };
    },
};

/**
 * DOM Utilities
 */
const DOMUtils = {
    /**
     * Render characters in the paragraph with proper styling
     * @param {string} text - The full paragraph text
     * @param {string} typed - What the user has typed
     * @param {HTMLElement} container - Container to render into
     */
    renderParagraph(text, typed, container) {
        container.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.className = 'character';

            if (i < typed.length) {
                if (typed[i] === text[i]) {
                    span.classList.add('correct');
                } else {
                    span.classList.add('incorrect');
                }
            } else if (i === typed.length) {
                span.classList.add('current');
            } else {
                span.classList.add('upcoming');
            }

            span.textContent = text[i];
            container.appendChild(span);
        }
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success or failure
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return false;
        }
    },

    /**
     * Request fullscreen
     * @param {HTMLElement} element - Element to fullscreen
     */
    requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    },

    /**
     * Exit fullscreen
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    },

    /**
     * Check if in fullscreen
     * @returns {boolean}
     */
    isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.mozFullScreenElement || 
                 document.msFullscreenElement);
    },

    /**
     * Show a temporary notification
     * @param {string} message - Message to show
     * @param {string} type - Type: 'success', 'error', 'info'
     * @param {number} duration - Duration in ms
     */
    showNotification(message, type = 'info', duration = 2000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            border-radius: 8px;
            border: 1px solid var(--accent-muted);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
            font-family: 'JetBrains Mono', monospace;
        `;

        if (type === 'success') {
            notification.style.borderColor = 'var(--accent-success)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--accent-wrong)';
        }

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },
};

/**
 * Data Utilities
 */
const DataUtils = {
    /**
     * Load day data from JSON file
     * @param {number} dayId - The day ID
     * @returns {Promise<object>} Day data
     */
    async loadDay(dayId) {
        try {
            const response = await fetch(`/days/day${dayId}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading day${dayId}.json:`, error);
            throw error;
        }
    },

    /**
     * Load all days metadata
     * @returns {Promise<array>} Array of day metadata
     */
    async loadAllDays() {
        try {
            // Try to load days 1-50
            const maxDays = 50;
            const days = [];
            
            for (let i = 1; i <= maxDays; i++) {
                try {
                    const day = await this.loadDay(i);
                    days.push(day);
                } catch (error) {
                    // Day doesn't exist, continue
                    break;
                }
            }
            
            // Sort by day number descending (newest first)
            days.sort((a, b) => b.day - a.day);
            return days;
        } catch (error) {
            console.error('Error loading all days:', error);
            throw error;
        }
    },
};

/**
 * Add animation style to document
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, TimeUtils, TypingUtils, DOMUtils, DataUtils };
}
