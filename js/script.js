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
            itFullName: document.getElementById('itFullName'),
            itPhone: document.getElementById('itPhone'),
            
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
            MAX_AREA: 100000,
            WHATSAPP_NUMBER: '254717340777' // Business WhatsApp number
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

        // IT CTA button
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('click', 
                (e) => this.handleITCTA(e));
        }
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

        // Validate required fields
        if (!this.elements.areaInput.checkValidity()) {
            this.elements.areaInput.reportValidity();
            return;
        }
        
        if (!this.elements.itFullName.checkValidity() || !this.elements.itPhone.checkValidity()) {
            this.showErrorToast("Please provide your name and phone number");
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
            fullName: this.elements.itFullName.value,
            phone: this.elements.itPhone.value,
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

    handleITCTA(event) {
        event.preventDefault();
        
        // Validate contact information
        if (!this.elements.itFullName.checkValidity() || !this.elements.itPhone.checkValidity()) {
            this.showErrorToast("Please provide your name and phone number");
            return;
        }

        try {
            const formData = this.getITFormData();
            const results = this.calculateITNeeds(formData);
            this.sendITAssessmentToWhatsApp(formData, results);
        } catch (error) {
            console.error('Error sending IT assessment:', error);
            this.showErrorToast("Failed to send. Please try again.");
        }
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

        // Collect form data
        const formData = this.getWebDevFormData();

        // Show thank you message
        this.elements.step4.classList.add('hidden');
        this.elements.thankYouMessage.classList.remove('hidden');
        this.elements.thankYouMessage.scrollIntoView({ behavior: 'smooth' });

        // Send data to WhatsApp
        this.sendWebDevToWhatsApp(formData);

        this.trackEvent('webdev_assessment_submission', 'Web Development Assessment');
    }

    getWebDevFormData() {
        return {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            hasWebsite: document.querySelector('input[name="hasWebsite"]:checked').value,
            websiteUrl: document.getElementById('websiteUrl')?.value || '',
            projectType: document.getElementById('projectType').value,
            primaryGoal: document.getElementById('primaryGoal').value,
            timeline: document.getElementById('timeline').value,
            problems: this.getSelectedProblems(),
            benefits: this.getSelectedBenefits()
        };
    }

    getSelectedProblems() {
        return Array.from(document.querySelectorAll('#problemsSection input[type="checkbox"]:checked'))
            .map(cb => cb.nextElementSibling.textContent.trim());
    }

    getSelectedBenefits() {
        return Array.from(document.querySelectorAll('#benefitsSection input[type="checkbox"]:checked'))
            .map(cb => cb.nextElementSibling.textContent.trim());
    }

    enableSubmit() {
        if (this.elements.submitBtn) {
            this.elements.submitBtn.disabled = false;
        }
    }

    // =====================
    // WHATSAPP INTEGRATION
    // =====================
    sendWebDevToWhatsApp(formData) {
        try {
            // Create WhatsApp message content
            let message = `*New Web Development Inquiry*\n\n`;
            message += `👤 *Name:* ${formData.fullName}\n`;
            message += `📱 *Phone:* ${formData.phone}\n`;
            message += `🌐 *Has Website:* ${formData.hasWebsite === 'yes' ? 'Yes' : 'No'}\n`;
            
            if (formData.hasWebsite === 'yes' && formData.websiteUrl) {
                message += `🔗 *Website URL:* ${formData.websiteUrl}\n`;
            }
            
            message += `\n*Project Details:*\n`;
            message += `🛠️ *Project Type:* ${formData.projectType}\n`;
            message += `🎯 *Primary Goal:* ${formData.primaryGoal}\n`;
            message += `⏱️ *Timeline:* ${formData.timeline}\n`;
            
            if (formData.hasWebsite === 'yes' && formData.problems.length) {
                message += `\n*Reported Problems:*\n`;
                formData.problems.forEach((p, i) => message += `➡️ ${i + 1}. ${p}\n`);
            }
            
            if (formData.hasWebsite === 'no' && formData.benefits.length) {
                message += `\n*Desired Benefits:*\n`;
                formData.benefits.forEach((b, i) => message += `✅ ${i + 1}. ${b}\n`);
            }
            
            message += `\n_Generated by Digital Solutions App_`;
            
            this.openWhatsApp(message);
            
        } catch (error) {
            console.error('Error sending to WhatsApp:', error);
            this.showErrorToast("Couldn't open WhatsApp. Please contact us directly.");
        }
    }

    sendITAssessmentToWhatsApp(formData, results) {
        try {
            const { area, buildingType, needsCabling, needsCCTV, 
                    needsAccessControl, needsTelephony } = formData;
            const { accessPoints, estimatedDevices, recommendedServers, recommendedWorkstations } = results;
            
            // Create WhatsApp message content
            let message = `*New IT Infrastructure Assessment*\n\n`;
            message += `👤 *Name:* ${formData.fullName}\n`;
            message += `📱 *Phone:* ${formData.phone}\n`;
            message += `🏢 *Building Type:* ${buildingType}\n`;
            message += `📏 *Area:* ${area.toLocaleString()} sq. ft\n`;
            
            message += `\n*Assessment Results:*\n`;
            message += `📶 *WiFi Access Points:* ${accessPoints}\n`;
            message += `💻 *Estimated Devices:* ${estimatedDevices.toLocaleString()}\n`;
            message += `🖥️ *Workstations:* ${recommendedWorkstations}\n`;
            message += `🗄️ *Servers:* ${recommendedServers}\n`;
            
            // Additional services
            const services = [];
            if (needsCabling) services.push("structured cabling");
            if (needsCCTV) services.push("CCTV");
            if (needsAccessControl) services.push("access control");
            if (needsTelephony) services.push("telephony");
            
            if (services.length) {
                message += `\n*Additional Services:*\n`;
                message += `🔌 ${services.join("\n🔌 ")}\n`;
            }
            
            message += `\n_Generated by Digital Solutions App_`;
            
            this.openWhatsApp(message);
            
        } catch (error) {
            console.error('Error sending IT assessment:', error);
            this.showErrorToast("Couldn't open WhatsApp. Please contact us directly.");
        }
    }

    openWhatsApp(message) {
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp link
        const whatsappLink = `https://wa.me/${this.constants.WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab after a short delay
        setTimeout(() => {
            window.open(whatsappLink, '_blank');
        }, 1000);
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
        // Simple alert for now - could be replaced with a proper toast notification
        alert(`Error: ${message}`);
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