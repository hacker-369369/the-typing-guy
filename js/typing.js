
class TypingSession {
    constructor() {
        // URL parameters
        this.dayId = this.getUrlParam('day');

        // Data
        this.day = null;
        this.paragraph = '';

        // Typing state
        this.isTyping = false;
        this.isCompleted = false;
        this.typed = '';
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;

        // Stats
        this.personalBest = null;

        // DOM Elements
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.dayHeader = document.getElementById('day-header');
        this.personalBestDisplay = document.getElementById('personal-best-display');
        this.hookText = document.getElementById('hook-text');
        this.hookPb = document.getElementById('hook-pb');
        this.preStylingSection = document.getElementById('pre-typing-section');
        this.countdownSection = document.getElementById('countdown-section');
        this.typingSection = document.getElementById('typing-section');
        this.resultsSection = document.getElementById('results-section');

        this.paragraphPreview = document.getElementById('paragraph-preview-text');
        this.paragraphText = document.getElementById('paragraph-text');
        this.typingInput = document.getElementById('typing-input');
        this.paragraphContainer = document.querySelector('.paragraph-container');

        this.startButton = document.getElementById('start-button');
        this.copyButton = document.getElementById('copy-button');
        this.resetButton = document.getElementById('reset-button');
        this.fullscreenButton = document.getElementById('fullscreen-button');
        this.retryButton = document.getElementById('retry-button');
        this.homeButton = document.getElementById('home-button');

        this.wpmDisplay = document.getElementById('wpm-display');
        this.accuracyDisplay = document.getElementById('accuracy-display');
        this.progressDisplay = document.getElementById('progress-display');
        this.timerDisplay = document.getElementById('timer-display');
        this.progressBar = document.querySelector('.progress-fill');
        this.progressText = document.getElementById('progress-text');

        this.newRecordBanner = document.getElementById('new-record-banner');
        this.finalWpm = document.getElementById('final-wpm');
        this.finalAccuracy = document.getElementById('final-accuracy');
        this.finalTime = document.getElementById('final-time');
        this.finalCharacters = document.getElementById('final-characters');
        this.finalWords = document.getElementById('final-words');
        this.finalPersonalBest = document.getElementById('final-personal-best');
    }

    /**
     * Get URL parameter value
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value
     */
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Initialize the typing session
     */
    async init() {
        try {
            // Validate day ID
            if (!this.dayId) {
                throw new Error('No day specified');
            }

            // Load day data
            this.showLoading();
            this.day = await DataUtils.loadDay(this.dayId);
            this.paragraph = this.day.content;

            // Load personal best
            this.personalBest = StorageManager.getPersonalBest(this.dayId);

            // Render everything
            this.renderDayHeader();
            this.renderPreview();
            this.updatePersonalBestDisplay();
            this.attachEventListeners();

            this.hideLoading();
        } catch (error) {
            console.error('Error initializing session:', error);
            this.showError();
        }
    }

    /**
     * Render day header information
     */
    renderDayHeader() {
        document.title = `Day ${this.day.day} | The Typing Guy`;

        document.querySelector('.day-title').textContent = this.day.title;
        document.querySelector('.day-number').textContent = `Day ${this.day.day}`;
        document.querySelector('.category-badge').textContent = this.day.category;
        document.querySelector('.date-display').textContent = TimeUtils.formatDate(this.day.date);
        
        // Set hook text
        if (this.hookText) {
            this.hookText.textContent = `Day ${this.day.day} of typing interesting things until I reach 100 WPM`;
        }
    }

    /**
     * Render paragraph preview
     */
    renderPreview() {
        this.paragraphPreview.textContent = this.paragraph;
    }

    /**
     * Update personal best display
     */
    updatePersonalBestDisplay() {
        if (this.personalBest) {
            const pbValue = `${this.personalBest.wpm} WPM`;
            if (this.personalBestDisplay) {
                this.personalBestDisplay.textContent = pbValue;
            }
            if (this.hookPb) {
                this.hookPb.textContent = pbValue;
            }
        } else {
            if (this.personalBestDisplay) {
                this.personalBestDisplay.textContent = '--';
            }
            if (this.hookPb) {
                this.hookPb.textContent = '--';
            }
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (this.startButton) this.startButton.addEventListener('click', () => this.handleStart());
        if (this.copyButton) this.copyButton.addEventListener('click', () => this.handleCopy());
        if (this.resetButton) this.resetButton.addEventListener('click', () => this.handleReset());
        if (this.fullscreenButton) this.fullscreenButton.addEventListener('click', () => this.handleFullscreen());
        if (this.retryButton) this.retryButton.addEventListener('click', () => this.handleRetry());
        if (this.homeButton) this.homeButton.addEventListener('click', () => this.handleHome());
        
        if (this.typingInput) {
            this.typingInput.addEventListener('input', (e) => this.handleTyping(e));
            this.typingInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        }
        
        document.addEventListener('keydown', (e) => {
            if (this.isTyping && e.key !== 'Tab' && this.typingInput) {
                this.typingInput.focus();
            }
        });

        // Click paragraph to focus input
        if (this.paragraphContainer) {
            this.paragraphContainer.addEventListener('click', () => {
                if (this.isTyping && this.typingInput) {
                    this.typingInput.focus();
                }
            });
        }
    }

    /**
     * Handle start button click
     */
    handleStart() {
        this.preStylingSection.style.display = 'none';
        this.countdownSection.style.display = 'flex';
        
        this.startCountdown();
    }

    /**
     * Start countdown sequence
     */
    startCountdown() {
        let count = 3;
        const countdownNumber = document.getElementById('countdown-number');

        const countdown = setInterval(() => {
            countdownNumber.textContent = count;
            countdownNumber.style.animation = 'none';
            setTimeout(() => {
                countdownNumber.style.animation = 'countdownPulse 0.6s ease-out';
            }, 0);

            count--;

            if (count < 0) {
                clearInterval(countdown);
                this.startTyping();
            }
        }, 1000);
    }

    /**
     * Start typing session
     */
    startTyping() {
        this.countdownSection.style.display = 'none';
        this.typingSection.style.display = 'flex';
        
        this.isTyping = true;
        this.typed = '';
        this.startTime = Date.now();
        this.elapsedTime = 0;

        // Render initial paragraph
        DOMUtils.renderParagraph(this.paragraph, this.typed, this.paragraphText);

        // Focus input
        this.typingInput.focus();
        this.typingInput.value = '';

        // Start timer
        this.timerInterval = setInterval(() => {
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
            this.timerDisplay.textContent = TimeUtils.formatTime(this.elapsedTime);
            this.updateStats();
        }, 100);

        // Make paragraph container active
        this.paragraphContainer.classList.add('active');
    }

    /**
     * Handle typing input
     * @param {Event} event - Input event
     */
  handleTyping(event) {
        if (!this.isTyping) return;

        this.typed = event.target.value;
        const currentChar = this.paragraph[this.typed.length - 1];
        const lastTypedChar = this.typed[this.typed.length - 1];

        // Check if the user typed something
        if (this.typed.length > 0) {
            if (lastTypedChar !== currentChar) {
                // --- WRONG SOUND ---
                const wrongSound = document.getElementById('wrongSound');
                if (wrongSound) {
                    wrongSound.currentTime = 0;
                    wrongSound.volume = 0.5; // <-- ADDED THIS LINE HERE
                    wrongSound.play().catch(error => console.log("Audio play failed:", error));
                }
            } else {
                // --- NEW: CORRECT KEY SOUND ---
                const keySound = document.getElementById('keySound');
                if (keySound) {
                    keySound.currentTime = 0; // Rewind to start for fast typing
                    keySound.volume = 0.6;    // Optional: make normal typing slightly quieter
                    keySound.play().catch(error => console.log("Audio play failed:", error));
                }
            }
        }

        // Check if completed
        if (this.typed.length === this.paragraph.length) {
            this.complete();
        } else {
            // Update paragraph rendering
            DOMUtils.renderParagraph(this.paragraph, this.typed, this.paragraphText);
            
            // Scroll to current character
            this.scrollToCurrentCharacter();
        }
    }

    /**
     * Scroll to keep current character visible
     */
    scrollToCurrentCharacter() {
        if (!this.paragraphText) return;
        
        // Find current character element
        const currentChar = this.paragraphText.querySelector('.character.current');
        if (currentChar) {
            const charRect = currentChar.getBoundingClientRect();
            const textRect = this.paragraphText.getBoundingClientRect();
            
            // Calculate character position relative to paragraph-text
            const charPosInText = charRect.top - textRect.top + this.paragraphText.scrollTop;
            const textHeight = this.paragraphText.clientHeight;
            const charHeight = charRect.height;
            
            // Scroll to keep character visible with padding
            const scrollTarget = charPosInText - textHeight / 3;
            if (scrollTarget > this.paragraphText.scrollTop || 
                charPosInText + charHeight > this.paragraphText.scrollTop + textHeight) {
                this.paragraphText.scrollTop = Math.max(0, scrollTarget);
            }
        }
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keydown event
     */
    handleKeydown(event) {
        // Prevent default behavior for certain keys
        if (event.key === 'Tab') {
            event.preventDefault();
        }
    }

    /**
     * Update live statistics
     */
    updateStats() {
        if (this.elapsedTime === 0) return;

        // Count comparison
        const comparison = TypingUtils.compareTyping(this.typed, this.paragraph);

        // Calculate stats
        const wpm = TypingUtils.calculateWPM(comparison.correct, this.elapsedTime);
        const accuracy = TypingUtils.calculateAccuracy(comparison.correct, this.typed.length);
        const progress = Math.round((this.typed.length / this.paragraph.length) * 100);

        // Update displays
        this.wpmDisplay.textContent = Math.round(wpm);
        this.accuracyDisplay.textContent = accuracy + '%';
        this.progressDisplay.textContent = progress + '%';

        // Update progress bar
        const progressPercent = (this.typed.length / this.paragraph.length) * 100;
        this.progressBar.style.width = progressPercent + '%';
        
        // Update progress text
        if (this.progressText) {
            this.progressText.textContent = Math.round(progressPercent) + '%';
        }
    }

    /**
     * Complete typing session
     */
    complete() {
        this.isTyping = false;
        this.isCompleted = true;

        // Stop timer
        clearInterval(this.timerInterval);

        // Calculate final stats
        const comparison = TypingUtils.compareTyping(this.typed, this.paragraph);
        const wpm = TypingUtils.calculateWPM(comparison.correct, this.elapsedTime);
        const accuracy = TypingUtils.calculateAccuracy(comparison.correct, this.typed.length);
        const words = TypingUtils.countWords(this.typed);

        // Check for new personal best
        const isNewRecord = !this.personalBest || wpm > this.personalBest.wpm;

        // Save stats
        if (isNewRecord) {
            const stats = {
                wpm: Math.round(wpm),
                accuracy,
                timestamp: new Date().toISOString(),
            };
            StorageManager.setPersonalBest(this.dayId, stats);
            this.personalBest = stats;
        }

        // Show results
        this.showResults({
            wpm: Math.round(wpm),
            accuracy,
            time: this.elapsedTime,
            characters: comparison.correct,
            words,
            isNewRecord,
        });
    }

    /**
     * Show results screen
     * @param {object} stats - Final statistics
     */
    showResults(stats) {
        // Hide typing section
        this.typingSection.style.display = 'none';
        this.resultsSection.style.display = 'flex';

        // Update results display
        this.finalWpm.textContent = `${stats.wpm} WPM`;
        this.finalAccuracy.textContent = `${stats.accuracy}%`;
        this.finalTime.textContent = TimeUtils.formatTime(stats.time);
        this.finalCharacters.textContent = stats.characters;
        this.finalWords.textContent = stats.words;

        // Show personal best
        if (this.personalBest) {
            this.finalPersonalBest.textContent = `${this.personalBest.wpm} WPM`;
        } else {
            this.finalPersonalBest.textContent = '--';
        }

        // Show new record banner if applicable
        if (stats.isNewRecord) {
            this.newRecordBanner.style.display = 'block';
        }
    }

    /**
     * Handle copy button click
     */
    async handleCopy() {
        const success = await DOMUtils.copyToClipboard(this.paragraph);
        if (success) {
            DOMUtils.showNotification('Paragraph copied to clipboard!', 'success');
        } else {
            DOMUtils.showNotification('Failed to copy', 'error');
        }
    }

    /**
     * Handle reset button click
     */
    handleReset() {
        this.typed = '';
        this.typingInput.value = '';
        clearInterval(this.timerInterval);
        this.elapsedTime = 0;
        this.startTime = null;
        this.isTyping = false;

        // Reset displays
        this.timerDisplay.textContent = '0:00';
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100%';
        this.progressDisplay.textContent = '0%';
        this.progressBar.style.width = '0%';

        // Reset paragraph highlighting
        DOMUtils.renderParagraph(this.paragraph, '', this.paragraphText);
        this.paragraphContainer.classList.remove('active');

        // Focus input
        this.typingInput.focus();
    }

    /**
     * Handle fullscreen button click
     */
    handleFullscreen() {
        if (DOMUtils.isFullscreen()) {
            DOMUtils.exitFullscreen();
        } else {
            DOMUtils.requestFullscreen(this.paragraphContainer);
        }
    }

    /**
     * Handle retry button click
     */
    handleRetry() {
        // Reset everything
        this.typed = '';
        this.typingInput.value = '';
        this.elapsedTime = 0;
        this.startTime = null;
        this.isTyping = false;
        this.isCompleted = false;

        // Reset displays
        this.resultsSection.style.display = 'none';
        this.newRecordBanner.style.display = 'none';
        this.preStylingSection.style.display = 'flex';
        this.paragraphContainer.classList.remove('active');

        // Reset stats display
        this.timerDisplay.textContent = '0:00';
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100%';
        this.progressDisplay.textContent = '0%';
        this.progressBar.style.width = '0%';

        DOMUtils.renderParagraph(this.paragraph, '', this.paragraphText);
    }

    /**
     * Handle home button click
     */
    handleHome() {
        window.location.href = 'index.html';
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.loadingState.style.display = 'flex';
        this.dayHeader.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.loadingState.style.display = 'none';
        this.dayHeader.style.display = 'block';
    }

    /**
     * Show error state
     */
    /**
     * Show error state
     */
    showError() {
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'flex';
        this.dayHeader.style.display = 'none';
    }
}

// Initialize typing session when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const session = new TypingSession();
        session.init();
    });
} else {
    const session = new TypingSession();
    session.init();
}