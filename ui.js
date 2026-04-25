/**
 * CropSmart UI Module
 */

const UIManager = {
    init() {
        this.applyTheme();
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `
            <span style="margin-right: 10px;">${icon}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-dismiss after 3s
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('cropsmart_darkmode', isDark);
        this.updateThemeIcons();
    },

    applyTheme() {
        const isDark = localStorage.getItem('cropsmart_darkmode') === 'true';
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        this.updateThemeIcons();
    },

    updateThemeIcons() {
        const themeIcons = document.querySelectorAll('.theme-toggle-icon');
        const isDark = document.body.classList.contains('dark');
        themeIcons.forEach(icon => {
            icon.textContent = isDark ? '☀️' : '🌙';
        });
    },

    // Utility to animate counters
    animateCounter(element, start, end, duration) {
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.innerText = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    },

    // Utility to show/hide loading state on buttons
    setLoading(button, isLoading, text = '...') {
        if (isLoading) {
            button.dataset.originalText = button.innerText;
            button.innerHTML = `<span class="spinner"></span> ${text}`;
            button.disabled = true;
        } else {
            button.innerText = button.dataset.originalText;
            button.disabled = false;
        }
    }
};

// Initialize UI
document.addEventListener('DOMContentLoaded', () => UIManager.init());
