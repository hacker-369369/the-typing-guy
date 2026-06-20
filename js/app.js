<<<<<<< HEAD


class HomePage {
    constructor() {
        this.days = [];
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.emptyState = document.getElementById('empty-state');
        this.daysGrid = document.getElementById('days-grid');
    }

    /**
     * Initialize the homepage
     */
    async init() {
        try {
            await this.loadDays();
            this.renderDays();
        } catch (error) {
            console.error('Failed to initialize homepage:', error);
            this.showError();
        }
    }

    /**
     * Load all days from JSON files
     */
    async loadDays() {
        try {
            this.loadingState.style.display = 'flex';
            this.days = await DataUtils.loadAllDays();
            this.loadingState.style.display = 'none';

            if (this.days.length === 0) {
                this.showEmpty();
            }
        } catch (error) {
            console.error('Error loading days:', error);
            this.loadingState.style.display = 'none';
            throw error;
        }
    }

    /**
     * Render all days as cards
     */
    renderDays() {
        if (this.days.length === 0) {
            this.showEmpty();
            return;
        }

        this.daysGrid.innerHTML = '';

        this.days.forEach((day) => {
            const card = this.createDayCard(day);
            this.daysGrid.appendChild(card);
        });
    }

    /**
     * Create a single day card
     * @param {object} day - Day data
     * @returns {HTMLElement} Card element
     */
    createDayCard(day) {
        const card = document.createElement('a');
        card.className = 'day-card';
        card.href = `day.html?day=${day.day}`;
        card.title = `Click to start typing Day ${day.day}`;

        // Update page title when hovering
        card.addEventListener('mouseenter', () => {
            document.title = `Day ${day.day} | The Typing Guy`;
        });

        card.addEventListener('mouseleave', () => {
            document.title = 'The Typing Guy';
        });

        const dayNumberEl = document.createElement('div');
        dayNumberEl.className = 'day-number';
        dayNumberEl.textContent = `Day ${day.day}`;

        const titleEl = document.createElement('h2');
        titleEl.className = 'day-card-title';
        titleEl.textContent = day.title;

        const metaEl = document.createElement('div');
        metaEl.className = 'day-card-meta';

        const categoryEl = document.createElement('span');
        categoryEl.className = 'category-badge';
        categoryEl.textContent = day.category;

        const dateEl = document.createElement('span');
        dateEl.className = 'date-badge';
        dateEl.textContent = TimeUtils.formatDate(day.date);

        metaEl.appendChild(categoryEl);
        metaEl.appendChild(dateEl);

        card.appendChild(dayNumberEl);
        card.appendChild(titleEl);
        card.appendChild(metaEl);

        return card;
    }

    /**
     * Show error message
     */
    showError() {
        this.daysGrid.style.display = 'none';
        this.errorState.style.display = 'flex';
    }

    /**
     * Show empty state
     */
    showEmpty() {
        this.daysGrid.style.display = 'none';
        this.emptyState.style.display = 'flex';
    }
}

// Initialize homepage when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new HomePage();
        app.init();
    });
} else {
    const app = new HomePage();
    app.init();
}
=======


class HomePage {
    constructor() {
        this.days = [];
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.emptyState = document.getElementById('empty-state');
        this.daysGrid = document.getElementById('days-grid');
    }

    /**
     * Initialize the homepage
     */
    async init() {
        try {
            await this.loadDays();
            this.renderDays();
        } catch (error) {
            console.error('Failed to initialize homepage:', error);
            this.showError();
        }
    }

    /**
     * Load all days from JSON files
     */
    async loadDays() {
        try {
            this.loadingState.style.display = 'flex';
            this.days = await DataUtils.loadAllDays();
            this.loadingState.style.display = 'none';

            if (this.days.length === 0) {
                this.showEmpty();
            }
        } catch (error) {
            console.error('Error loading days:', error);
            this.loadingState.style.display = 'none';
            throw error;
        }
    }

    /**
     * Render all days as cards
     */
    renderDays() {
        if (this.days.length === 0) {
            this.showEmpty();
            return;
        }

        this.daysGrid.innerHTML = '';

        this.days.forEach((day) => {
            const card = this.createDayCard(day);
            this.daysGrid.appendChild(card);
        });
    }

    /**
     * Create a single day card
     * @param {object} day - Day data
     * @returns {HTMLElement} Card element
     */
    createDayCard(day) {
        const card = document.createElement('a');
        card.className = 'day-card';
        card.href = `day.html?day=${day.day}`;
        card.title = `Click to start typing Day ${day.day}`;

        // Update page title when hovering
        card.addEventListener('mouseenter', () => {
            document.title = `Day ${day.day} | The Typing Guy`;
        });

        card.addEventListener('mouseleave', () => {
            document.title = 'The Typing Guy';
        });

        const dayNumberEl = document.createElement('div');
        dayNumberEl.className = 'day-number';
        dayNumberEl.textContent = `Day ${day.day}`;

        const titleEl = document.createElement('h2');
        titleEl.className = 'day-card-title';
        titleEl.textContent = day.title;

        const metaEl = document.createElement('div');
        metaEl.className = 'day-card-meta';

        const categoryEl = document.createElement('span');
        categoryEl.className = 'category-badge';
        categoryEl.textContent = day.category;

        const dateEl = document.createElement('span');
        dateEl.className = 'date-badge';
        dateEl.textContent = TimeUtils.formatDate(day.date);

        metaEl.appendChild(categoryEl);
        metaEl.appendChild(dateEl);

        card.appendChild(dayNumberEl);
        card.appendChild(titleEl);
        card.appendChild(metaEl);

        return card;
    }

    /**
     * Show error message
     */
    showError() {
        this.daysGrid.style.display = 'none';
        this.errorState.style.display = 'flex';
    }

    /**
     * Show empty state
     */
    showEmpty() {
        this.daysGrid.style.display = 'none';
        this.emptyState.style.display = 'flex';
    }
}

// Initialize homepage when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new HomePage();
        app.init();
    });
} else {
    const app = new HomePage();
    app.init();
}
>>>>>>> aa67f116b3e3af53a493d0d40d516178b20d1582
