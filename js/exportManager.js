/**
 * Export Manager
 * Handles exporting models and sending quote requests
 */
export default class ExportManager {
    /**
     * Create an Export Manager instance
     * @param {SvgProcessor} svgProcessor - The SVG processor instance
     * @param {ModelGenerator} modelGenerator - The model generator instance
     */
    constructor(svgProcessor, modelGenerator) {
        this.svgProcessor = svgProcessor;
        this.modelGenerator = modelGenerator;
    }
    
    /**
     * Send a quote request with the current design data
     * @param {Object} model - The current THREE.js model
     * @param {Object} settings - Design settings
     * @param {String} text - Text input if in text mode
     * @param {String} email - User's email address (optional)
     * @param {String} name - User's name (optional)
     * @param {String} notes - Additional notes (optional)
     */
    async sendQuoteRequest(model, settings, text, email = '', name = '', notes = '') {
        // Show the loading/sending indicator
        document.getElementById('quote-sending').style.display = 'flex';
        
        try {
            // Create a blob of the model in STL format for sending
            const stlBlob = this.modelGenerator.generateSTLBlob(model);
            
            // Create a form data object with all the necessary information
            const formData = new FormData();
            formData.append('design_type', settings.designMode);
            formData.append('text', text || 'No text');
            formData.append('font', settings.font || 'Default');
            formData.append('extrusion_depth', settings.extrusionDepth);
            formData.append('colors', JSON.stringify({
                front: settings.frontColor,
                side: settings.sideColor
            }));
            
            if (stlBlob) {
                formData.append('stl_file', stlBlob, 'design.stl');
            }
            
            if (email) formData.append('email', email);
            if (name) formData.append('name', name);
            if (notes) formData.append('notes', notes);
            
            // In this version, we'll simulate sending by directly emailing
            await this.sendDirectEmail({
                email: 'he_texmexdex@yahoo.com',
                subject: 'New 3D Font Quote Request',
                text: this.generateEmailText(text, settings, name, email, notes)
            });
            
            // Hide loading indicator and show success message
            document.getElementById('quote-sending').style.display = 'none';
            document.getElementById('quote-success').style.display = 'flex';
            
            // Hide success message after a delay
            setTimeout(() => {
                document.getElementById('quote-success').style.display = 'none';
            }, 5000);
            
        } catch (error) {
            console.error('Error sending quote request:', error);
            
            // Hide loading indicator and show error message
            document.getElementById('quote-sending').style.display = 'none';
            document.getElementById('quote-error').style.display = 'flex';
            
            // Hide error message after a delay
            setTimeout(() => {
                document.getElementById('quote-error').style.display = 'none';
            }, 5000);
        }
    }
    
    /**
     * Generate email text for quote request
     */
    generateEmailText(text, settings, name, email, notes) {
        return `
New 3D Font Quote Request

Name: ${name || 'Not provided'}
Email: ${email || 'Not provided'}

Design Details:
- Text: ${text || 'No text'}
- Font: ${settings.font || 'Default'}
- Extrusion Depth: ${settings.extrusionDepth}mm
- Front Color: ${settings.frontColor}
- Side Color: ${settings.sideColor}
- Design Mode: ${settings.designMode}

Additional Notes:
${notes || 'None provided'}

This request was generated from the 3D Font Generator web application.
`;
    }
    
    /**
     * Send email directly using mailto link (client-side approach)
     * In a real production app, this would be handled by a backend service
     */
    async sendDirectEmail({ email, subject, text }) {
        // Create a mailto link
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
        
        // Open the default email client
        window.open(mailtoLink, '_blank');
        
        // Return a promise that resolves after a brief delay to simulate async behavior
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
}