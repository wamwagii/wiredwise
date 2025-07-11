/**
 * Digital Solutions App - Main Application Script
 * Handles portfolio filtering, IT infrastructure assessment, web development form, and general functionality
 */

class DigitalSolutionsApp {
    constructor() {
        // DOM Elements
        this.elements = {
            // Portfolio elements
            filterButtons: document.querySelectorAll('.filter-btn'),
            portfolioItems: document.querySelectorAll('.portfolio-item'),
            
            // IT Assessment elements
            connectivityForm: document.getElementById('connectivityForm'),
            areaInput: document.getElementById('area'),
            buildingTypeSelect: document.getElementById('buildingType'),
            resultText: document.getElementById('resultText'),
            deviceCount: document.getElementById('deviceCount'),
            additionalServicesText: document.getElementById('additionalServicesText'),
            estimateResult: document.getElementById('estimateResult'),
            ctaButton: document.getElementById('ctaButton'),
            yearElement: document.getElementById('year'),
            
            // Web Development Form elements
            webDevForm: document.getElementById('webDevelopmentForm'),
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3'),
            step4: document.getElementById('step4'),
            thankYouMessage: document.getElementById('thankYouMessage'),
            hasWebsiteRadios: document.querySelectorAll('input[name="hasWebsite"]'),
            problemsSection: document.getElementById('problemsSection'),
            benefitsSection: document.getElementById('benefitsSection'),
            websiteUrlContainer: document.getElementById('websiteUrlContainer'),
            problemCards: document.querySelectorAll('.problem-card'),
            submitBtn: document.getElementById('submitBtn'),
            honeypotField: document.getElementById('website')
        };

        // Application constants
        this.constants = {
            BASE_COVERAGE: 1500,
            DEVICE_FACTOR: 2,
            SERVER_FACTOR_SQFT: 5000,
            WORKSTATION_FACTOR_SQFT: 200,
            MIN_AREA: 100,
            MAX_AREA: 100000
        };

        // Initialize the application
        this.init();
    }

    init() {
        this.initEventListeners();
        this.setCopyrightYear();
        this.setupProblemCards();
        this.setupStepNavigation();
    }

    initEventListeners() {
        // Portfolio filtering
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // IT Assessment form
        if (this.elements.connectivityForm) {
            this.elements.connectivityForm.addEventListener('submit', 
                (e) => this.handleServiceFormSubmit(e));
        }

        // Area input validation
        if (this.elements.areaInput) {
            this.elements.areaInput.addEventListener('input', 
                () => this.validateAreaInput());
        }

        // Web Development form
        if (this.elements.webDevForm) {
            this.elements.webDevForm.addEventListener('submit', 
                (e) => this.handleWebDevSubmit(e));
        }

        // Website existence toggle
        this.elements.hasWebsiteRadios.forEach(radio => {
            radio.addEventListener('change', 
                () => this.toggleWebsiteFields(radio.value === 'yes'));
        });
    }

    setupProblemCards() {
        this.elements.problemCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    card.classList.toggle('selected', checkbox.checked);
                }
            });
        });
    }

    setupStepNavigation() {
        document.querySelectorAll('[data-step-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showStep(btn.dataset.stepTarget);
            });
        });
    }

    // =====================
    // GENERAL FUNCTIONALITY
    // =====================
    setCopyrightYear() {
        if (this.elements.yearElement) {
            this.elements.yearElement.textContent = new Date().getFullYear();
        }
    }

    showStep(stepId) {
        // Hide all steps
        [this.elements.step1, this.elements.step2, 
         this.elements.step3, this.elements.step4].forEach(step => {
            step?.classList.add('hidden');
        });
        
        // Show requested step
        document.getElementById(stepId)?.classList.remove('hidden');
    }

    // =====================
    // PORTFOLIO FUNCTIONALITY
    // =====================
    handleFilterClick(event) {
        const clickedButton = event.currentTarget;
        
        // Update button states
        this.elements.filterButtons.forEach(btn => {
            btn.classList.toggle('bg-blue-700', btn === clickedButton);
            btn.classList.toggle('text-white', btn === clickedButton);
            btn.classList.toggle('border', btn !== clickedButton);
            btn.classList.toggle('border-gray-300', btn !== clickedButton);
            btn.classList.toggle('hover:bg-gray-100', btn !== clickedButton);
        });

        // Filter items
        this.filterPortfolioItems(clickedButton.dataset.filter);
    }

    filterPortfolioItems(filter) {
        this.elements.portfolioItems.forEach(item => {
            const shouldShow = filter === 'all' || item.dataset.category.includes(filter);
            item.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                item.style.animation = 'fadeIn 0.3s ease-out';
            }
        });
    }

    // =====================
    // IT ASSESSMENT FUNCTIONALITY
    // =====================
    validateAreaInput() {
        const value = parseFloat(this.elements.areaInput.value);
        
        if (isNaN(value) || value < this.constants.MIN_AREA) {
            this.elements.areaInput.setCustomValidity(
                `Please enter an area of at least ${this.constants.MIN_AREA} sq. ft`
            );
        } else if (value > this.constants.MAX_AREA) {
            this.elements.areaInput.setCustomValidity(
                `Maximum area is ${this.constants.MAX_AREA} sq. ft`
            );
        } else {
            this.elements.areaInput.setCustomValidity('');
        }
    }

    handleServiceFormSubmit(event) {
        event.preventDefault();

        if (!this.elements.areaInput.checkValidity()) {
            this.elements.areaInput.reportValidity();
            return;
        }

        try {
            const formData = this.getITFormData();
            const results = this.calculateITNeeds(formData);
            this.displayITResults(formData, results);
            this.trackEvent('it_assessment_submission', 'IT Infrastructure Assessment');
        } catch (error) {
            console.error('Error processing IT assessment:', error);
            this.showErrorToast("An error occurred. Please try again.");
        }
    }

    getITFormData() {
        return {
            area: parseFloat(this.elements.areaInput.value),
            buildingFactor: parseFloat(this.elements.buildingTypeSelect.value),
            usageFactor: parseFloat(document.querySelector('input[name="usage"]:checked').value),
            needsCabling: document.querySelector('input[name="structuredCabling"]').checked,
            needsCCTV: document.querySelector('input[name="cctv"]').checked,
            needsAccessControl: document.querySelector('input[name="accessControl"]').checked,
            needsTelephony: document.querySelector('input[name="telephony"]').checked,
            buildingType: this.elements.buildingTypeSelect.selectedOptions[0].text
        };
    }

    calculateITNeeds(data) {
        const { area, buildingFactor, usageFactor } = data;
        const { DEVICE_FACTOR, SERVER_FACTOR_SQFT, WORKSTATION_FACTOR_SQFT } = this.constants;

        const accessPoints = Math.max(1, Math.ceil((area * buildingFactor * usageFactor) / this.constants.BASE_COVERAGE));
        const estimatedDevices = Math.max(1, Math.floor(area / 100 * usageFactor * DEVICE_FACTOR));
        const recommendedServers = Math.max(1, Math.ceil(area / SERVER_FACTOR_SQFT));
        const recommendedWorkstations = Math.max(1, Math.ceil(area / WORKSTATION_FACTOR_SQFT));

        return { accessPoints, estimatedDevices, recommendedServers, recommendedWorkstations };
    }

    displayITResults(formData, results) {
        const { area, buildingType, needsCabling, needsCCTV, needsAccessControl, needsTelephony } = formData;
        const { accessPoints, estimatedDevices, recommendedServers, recommendedWorkstations } = results;

        // Generate results HTML
        let html = `
            <div class="space-y-3">
                <p>For your <strong>${area.toLocaleString()} sq. ft ${buildingType}</strong>, we recommend:</p>
                <p class="flex items-center">
                    <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <strong>${accessPoints <= 1 ? '1 WiFi system' : `${accessPoints} access points`}</strong>
                </p>
                <p class="flex items-center">
                    <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <strong>${recommendedWorkstations} workstations</strong> and 
                    <strong>${recommendedServers} server${recommendedServers > 1 ? 's' : ''}</strong>
                </p>
        `;

        // Additional services
        const services = [];
        if (needsCabling) services.push("structured cabling");
        if (needsCCTV) services.push("CCTV");
        if (needsAccessControl) services.push("access control");
        if (needsTelephony) services.push("telephony");

        if (services.length) {
            html += `
                <p class="flex items-center">
                    <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Consider adding <strong>${services.join(", ")}</strong>
                </p>
            `;
            this.elements.additionalServicesText.textContent = `Includes ${services.join(", ")}`;
            this.elements.ctaButton.textContent = "Get Complete IT Solution Quote";
        } else {
            this.elements.additionalServicesText.textContent = "Basic IT infrastructure assessment";
            this.elements.ctaButton.textContent = "Get Free IT Consultation";
        }

        html += `</div>`;
        this.elements.resultText.innerHTML = html;
        this.elements.deviceCount.textContent = estimatedDevices.toLocaleString();
        this.elements.estimateResult.classList.remove('hidden');

        // Scroll to results
        setTimeout(() => {
            this.elements.estimateResult.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    // =====================
    // WEB DEVELOPMENT FUNCTIONALITY
    // =====================
    toggleWebsiteFields(hasWebsite) {
        this.elements.problemsSection.classList.toggle('hidden', !hasWebsite);
        this.elements.benefitsSection.classList.toggle('hidden', hasWebsite);
        this.elements.websiteUrlContainer.classList.toggle('hidden', !hasWebsite);
    }

    handleWebDevSubmit(event) {
        event.preventDefault();

        // Honeypot validation
        if (this.elements.honeypotField.value !== '') return;

        // Show thank you message
        this.elements.step4.classList.add('hidden');
        this.elements.thankYouMessage.classList.remove('hidden');
        this.elements.thankYouMessage.scrollIntoView({ behavior: 'smooth' });

        this.trackEvent('webdev_assessment_submission', 'Web Development Assessment');
    }

    enableSubmit() {
        if (this.elements.submitBtn) {
            this.elements.submitBtn.disabled = false;
        }
    }

    // =====================
    // UTILITY METHODS
    // =====================
    trackEvent(eventName, eventLabel) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, {
                'event_category': 'engagement',
                'event_label': eventLabel
            });
        }
    }

    showErrorToast(message) {
        // Implement toast notification system here
        alert(message);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const app = new DigitalSolutionsApp();
    
    // Global callback for reCAPTCHA
    window.enableSubmit = () => {
        app.enableSubmit();
    };
});