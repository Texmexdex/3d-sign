/**
 * Local Fonts Collection
 * This file provides a collection of local/system fonts for use in the 3D Sign Creator
 * when the Google Fonts API is unavailable or fails.
 */
const LocalFontsCollection = {
    /**
     * Get a collection of system fonts that should be available on most systems
     * @returns {Array} - Array of font objects
     */
    getSystemFonts() {
        return [
            {
                family: 'Arial',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Arial'
            },
            {
                family: 'Arial Black',
                category: 'sans-serif',
                variants: ['regular'],
                displayName: 'Arial Black'
            },
            {
                family: 'Arial Narrow',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Arial Narrow'
            },
            {
                family: 'Bookman Old Style',
                category: 'serif',
                variants: ['regular', 'bold'],
                displayName: 'Bookman Old Style'
            },
            {
                family: 'Calibri',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Calibri'
            },
            {
                family: 'Cambria',
                category: 'serif',
                variants: ['regular', 'bold'],
                displayName: 'Cambria'
            },
            {
                family: 'Candara',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Candara'
            },
            {
                family: 'Comic Sans MS',
                category: 'handwriting',
                variants: ['regular', 'bold'],
                displayName: 'Comic Sans MS'
            },
            {
                family: 'Courier New',
                category: 'monospace',
                variants: ['regular', 'bold'],
                displayName: 'Courier New'
            },
            {
                family: 'Georgia',
                category: 'serif',
                variants: ['regular', 'bold'],
                displayName: 'Georgia'
            },
            {
                family: 'Impact',
                category: 'display',
                variants: ['regular'],
                displayName: 'Impact'
            },
            {
                family: 'Lucida Console',
                category: 'monospace',
                variants: ['regular'],
                displayName: 'Lucida Console'
            },
            {
                family: 'Lucida Sans Unicode',
                category: 'sans-serif',
                variants: ['regular'],
                displayName: 'Lucida Sans Unicode'
            },
            {
                family: 'Microsoft Sans Serif',
                category: 'sans-serif',
                variants: ['regular'],
                displayName: 'Microsoft Sans Serif'
            },
            {
                family: 'Palatino Linotype',
                category: 'serif',
                variants: ['regular', 'bold'],
                displayName: 'Palatino Linotype'
            },
            {
                family: 'Segoe UI',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Segoe UI'
            },
            {
                family: 'Tahoma',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Tahoma'
            },
            {
                family: 'Times New Roman',
                category: 'serif',
                variants: ['regular', 'bold'],
                displayName: 'Times New Roman'
            },
            {
                family: 'Trebuchet MS',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Trebuchet MS'
            },
            {
                family: 'Verdana',
                category: 'sans-serif',
                variants: ['regular', 'bold'],
                displayName: 'Verdana'
            }
        ];
    },
    
    /**
     * Get a collection of bundled local fonts 
     * @returns {Array} - Array of font objects
     */
    getBundledFonts() {
        return [
            // Roboto fonts
            {
                family: 'Roboto-Regular',
                displayName: 'Roboto Regular',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/Roboto-Regular.ttf'
            },
            {
                family: 'Roboto-Bold',
                displayName: 'Roboto Bold',
                category: 'sans-serif',
                variants: ['bold'],
                url: 'assets/fonts/Roboto-Bold.ttf'
            },
            {
                family: 'Roboto-Light',
                displayName: 'Roboto Light',
                category: 'sans-serif',
                variants: ['light'],
                url: 'assets/fonts/Roboto-Light.ttf'
            },
            {
                family: 'RobotoSlab',
                displayName: 'Roboto Slab',
                category: 'serif',
                variants: ['regular'],
                url: 'assets/fonts/RobotoSlab[wght].ttf'
            },
            // Previously added fonts
            {
                family: 'ChiliPepper',
                displayName: 'Chili Pepper',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/chilispepper.ttf'
            },
            {
                family: 'NogginBulb',
                displayName: 'Noggin Bulb',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/noggin_bulb_by_jpreckless2444_dd9dypo.otf.ttf'
            },
            // Newly added individual fonts
            {
                family: 'Aclonica',
                displayName: 'Aclonica',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/Aclonica-Regular.ttf'
            },
            {
                family: 'Arimo',
                displayName: 'Arimo',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/Arimo[wght].ttf'
            },
            {
                family: 'Arimo-Italic',
                displayName: 'Arimo Italic',
                category: 'sans-serif',
                variants: ['italic'],
                url: 'assets/fonts/Arimo-Italic[wght].ttf'
            },
            {
                family: 'Calligraffitti',
                displayName: 'Calligraffitti',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Calligraffitti-Regular.ttf'
            },
            // Ubuntu fonts
            {
                family: 'Ubuntu-Regular',
                displayName: 'Ubuntu Regular',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/Ubuntu-Regular.ttf'
            },
            {
                family: 'Ubuntu-Italic',
                displayName: 'Ubuntu Italic',
                category: 'sans-serif',
                variants: ['italic'],
                url: 'assets/fonts/Ubuntu-Italic.ttf'
            },
            {
                family: 'Ubuntu-Bold',
                displayName: 'Ubuntu Bold',
                category: 'sans-serif',
                variants: ['bold'],
                url: 'assets/fonts/Ubuntu-Bold.ttf'
            },
            {
                family: 'Ubuntu-BoldItalic',
                displayName: 'Ubuntu Bold Italic',
                category: 'sans-serif',
                variants: ['bold', 'italic'],
                url: 'assets/fonts/Ubuntu-BoldItalic.ttf'
            },
            {
                family: 'Ubuntu-Light',
                displayName: 'Ubuntu Light',
                category: 'sans-serif',
                variants: ['light'],
                url: 'assets/fonts/Ubuntu-Light.ttf'
            },
            {
                family: 'Ubuntu-LightItalic',
                displayName: 'Ubuntu Light Italic',
                category: 'sans-serif',
                variants: ['light', 'italic'],
                url: 'assets/fonts/Ubuntu-LightItalic.ttf'
            },
            {
                family: 'Ubuntu-Medium',
                displayName: 'Ubuntu Medium',
                category: 'sans-serif',
                variants: ['medium'],
                url: 'assets/fonts/Ubuntu-Medium.ttf'
            },
            {
                family: 'Ubuntu-MediumItalic',
                displayName: 'Ubuntu Medium Italic',
                category: 'sans-serif',
                variants: ['medium', 'italic'],
                url: 'assets/fonts/Ubuntu-MediumItalic.ttf'
            },
            {
                family: 'UbuntuCondensed',
                displayName: 'Ubuntu Condensed',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/UbuntuCondensed-Regular.ttf'
            },
            // Ubuntu Mono fonts
            {
                family: 'UbuntuMono-Regular',
                displayName: 'Ubuntu Mono',
                category: 'monospace',
                variants: ['regular'],
                url: 'assets/fonts/UbuntuMono-Regular.ttf'
            },
            {
                family: 'UbuntuMono-Bold',
                displayName: 'Ubuntu Mono Bold',
                category: 'monospace',
                variants: ['bold'],
                url: 'assets/fonts/UbuntuMono-Bold.ttf'
            },
            {
                family: 'UbuntuMono-Italic',
                displayName: 'Ubuntu Mono Italic',
                category: 'monospace',
                variants: ['italic'],
                url: 'assets/fonts/UbuntuMono-Italic.ttf'
            },
            {
                family: 'UbuntuMono-BoldItalic',
                displayName: 'Ubuntu Mono Bold Italic',
                category: 'monospace',
                variants: ['bold', 'italic'],
                url: 'assets/fonts/UbuntuMono-BoldItalic.ttf'
            },
            // Ubuntu Sans Variable fonts
            {
                family: 'UbuntuSans',
                displayName: 'Ubuntu Sans Variable',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/UbuntuSans[wdth,wght].ttf'
            },
            {
                family: 'UbuntuSans-Italic',
                displayName: 'Ubuntu Sans Variable Italic',
                category: 'sans-serif',
                variants: ['italic'],
                url: 'assets/fonts/UbuntuSans-Italic[wdth,wght].ttf'
            },
            // Ubuntu Sans Mono Variable fonts
            {
                family: 'UbuntuSansMono',
                displayName: 'Ubuntu Sans Mono Variable',
                category: 'monospace',
                variants: ['regular'],
                url: 'assets/fonts/UbuntuSansMono[wght].ttf'
            },
            {
                family: 'UbuntuSansMono-Italic',
                displayName: 'Ubuntu Sans Mono Variable Italic',
                category: 'monospace',
                variants: ['italic'],
                url: 'assets/fonts/UbuntuSansMono-Italic[wght].ttf'
            },
            
            // Additional Google Fonts
            {
                family: 'CherryCreamSoda',
                displayName: 'Cherry Cream Soda',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/CherryCreamSoda-Regular.ttf'
            },
            {
                family: 'Chewy',
                displayName: 'Chewy',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/Chewy-Regular.ttf'
            },
            {
                family: 'ComingSoon',
                displayName: 'Coming Soon',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/ComingSoon-Regular.ttf'
            },
            {
                family: 'Cousine',
                displayName: 'Cousine',
                category: 'monospace',
                variants: ['regular'],
                url: 'assets/fonts/Cousine-Regular.ttf'
            },
            {
                family: 'Cousine-Bold',
                displayName: 'Cousine Bold',
                category: 'monospace',
                variants: ['bold'],
                url: 'assets/fonts/Cousine-Bold.ttf'
            },
            {
                family: 'Cousine-Italic',
                displayName: 'Cousine Italic',
                category: 'monospace',
                variants: ['italic'],
                url: 'assets/fonts/Cousine-Italic.ttf'
            },
            {
                family: 'Cousine-BoldItalic',
                displayName: 'Cousine Bold Italic',
                category: 'monospace',
                variants: ['bold', 'italic'],
                url: 'assets/fonts/Cousine-BoldItalic.ttf'
            },
            {
                family: 'CraftyGirls',
                displayName: 'Crafty Girls',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/CraftyGirls-Regular.ttf'
            },
            {
                family: 'CreepsterCaps',
                displayName: 'Creepster Caps',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/CreepsterCaps-Regular.ttf'
            },
            {
                family: 'Crushed',
                displayName: 'Crushed',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/Crushed-Regular.ttf'
            },
            {
                family: 'FontdinerSwanky',
                displayName: 'Fontdiner Swanky',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/FontdinerSwanky-Regular.ttf'
            },
            {
                family: 'HomemadeApple',
                displayName: 'Homemade Apple',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/HomemadeApple-Regular.ttf'
            },
            {
                family: 'IrishGrover',
                displayName: 'Irish Grover',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/IrishGrover-Regular.ttf'
            },
            {
                family: 'JustAnotherHand',
                displayName: 'Just Another Hand',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/JustAnotherHand-Regular.ttf'
            },
            {
                family: 'Kosugi',
                displayName: 'Kosugi',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/Kosugi-Regular.ttf'
            },
            {
                family: 'KosugiMaru',
                displayName: 'Kosugi Maru',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/KosugiMaru-Regular.ttf'
            },
            {
                family: 'Kranky',
                displayName: 'Kranky',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/Kranky-Regular.ttf'
            },
            {
                family: 'LuckiestGuy',
                displayName: 'Luckiest Guy',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/LuckiestGuy-Regular.ttf'
            },
            {
                family: 'MaidenOrange',
                displayName: 'Maiden Orange',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/MaidenOrange-Regular.ttf'
            },
            {
                family: 'Montez',
                displayName: 'Montez',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Montez-Regular.ttf'
            },
            {
                family: 'MountainsofChristmas',
                displayName: 'Mountains of Christmas',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/MountainsofChristmas-Regular.ttf'
            },
            {
                family: 'MountainsofChristmas-Bold',
                displayName: 'Mountains of Christmas Bold',
                category: 'display',
                variants: ['bold'],
                url: 'assets/fonts/MountainsofChristmas-Bold.ttf'
            },
            // OpenSansHebrew fonts
            {
                family: 'OpenSansHebrew',
                displayName: 'Open Sans Hebrew',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/OpenSansHebrew-Regular.ttf'
            },
            {
                family: 'OpenSansHebrew-Bold',
                displayName: 'Open Sans Hebrew Bold',
                category: 'sans-serif',
                variants: ['bold'],
                url: 'assets/fonts/OpenSansHebrew-Bold.ttf'
            },
            {
                family: 'OpenSansHebrew-Italic',
                displayName: 'Open Sans Hebrew Italic',
                category: 'sans-serif',
                variants: ['italic'],
                url: 'assets/fonts/OpenSansHebrew-Italic.ttf'
            },
            {
                family: 'OpenSansHebrew-Light',
                displayName: 'Open Sans Hebrew Light',
                category: 'sans-serif',
                variants: ['light'],
                url: 'assets/fonts/OpenSansHebrew-Light.ttf'
            },
            {
                family: 'OpenSansHebrewCondensed',
                displayName: 'Open Sans Hebrew Condensed',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/OpenSansHebrewCondensed-Regular.ttf'
            },
            {
                family: 'OpenSansHebrewCondensed-Bold',
                displayName: 'Open Sans Hebrew Condensed Bold',
                category: 'sans-serif',
                variants: ['bold'],
                url: 'assets/fonts/OpenSansHebrewCondensed-Bold.ttf'
            },
            {
                family: 'PermanentMarker',
                displayName: 'Permanent Marker',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/PermanentMarker-Regular.ttf'
            },
            {
                family: 'Rancho',
                displayName: 'Rancho',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Rancho-Regular.ttf'
            },
            {
                family: 'Redressed',
                displayName: 'Redressed',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Redressed-Regular.ttf'
            },
            {
                family: 'Rochester',
                displayName: 'Rochester',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Rochester-Regular.ttf'
            },
            {
                family: 'RockSalt',
                displayName: 'Rock Salt',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/RockSalt-Regular.ttf'
            },
            {
                family: 'Satisfy',
                displayName: 'Satisfy',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Satisfy-Regular.ttf'
            },
            {
                family: 'Schoolbell',
                displayName: 'Schoolbell',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Schoolbell-Regular.ttf'
            },
            {
                family: 'Slackey',
                displayName: 'Slackey',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/Slackey-Regular.ttf'
            },
            {
                family: 'Smokum',
                displayName: 'Smokum',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/Smokum-Regular.ttf'
            },
            {
                family: 'SpecialElite',
                displayName: 'Special Elite',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/SpecialElite-Regular.ttf'
            },
            {
                family: 'Sunshiney',
                displayName: 'Sunshiney',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Sunshiney-Regular.ttf'
            },
            {
                family: 'Syncopate',
                displayName: 'Syncopate',
                category: 'sans-serif',
                variants: ['regular'],
                url: 'assets/fonts/Syncopate-Regular.ttf'
            },
            {
                family: 'Syncopate-Bold',
                displayName: 'Syncopate Bold',
                category: 'sans-serif',
                variants: ['bold'],
                url: 'assets/fonts/Syncopate-Bold.ttf'
            },
            // Tinos fonts
            {
                family: 'Tinos',
                displayName: 'Tinos',
                category: 'serif',
                variants: ['regular'],
                url: 'assets/fonts/Tinos-Regular.ttf'
            },
            {
                family: 'Tinos-Bold',
                displayName: 'Tinos Bold',
                category: 'serif',
                variants: ['bold'],
                url: 'assets/fonts/Tinos-Bold.ttf'
            },
            {
                family: 'Tinos-Italic',
                displayName: 'Tinos Italic',
                category: 'serif',
                variants: ['italic'],
                url: 'assets/fonts/Tinos-Italic.ttf'
            },
            {
                family: 'Tinos-BoldItalic',
                displayName: 'Tinos Bold Italic',
                category: 'serif',
                variants: ['bold', 'italic'],
                url: 'assets/fonts/Tinos-BoldItalic.ttf'
            },
            {
                family: 'Ultra',
                displayName: 'Ultra',
                category: 'serif',
                variants: ['regular'],
                url: 'assets/fonts/Ultra-Regular.ttf'
            },
            {
                family: 'Unkempt',
                displayName: 'Unkempt',
                category: 'display',
                variants: ['regular'],
                url: 'assets/fonts/Unkempt-Regular.ttf'
            },
            {
                family: 'Unkempt-Bold',
                displayName: 'Unkempt Bold',
                category: 'display',
                variants: ['bold'],
                url: 'assets/fonts/Unkempt-Bold.ttf'
            },
            {
                family: 'WalterTurncoat',
                displayName: 'Walter Turncoat',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/WalterTurncoat-Regular.ttf'
            },
            {
                family: 'Yellowtail',
                displayName: 'Yellowtail',
                category: 'handwriting',
                variants: ['regular'],
                url: 'assets/fonts/Yellowtail-Regular.ttf'
            }
        ];
    },
    
    /**
     * Get all available local fonts
     * @returns {Array} - Array of font objects
     */
    getAllFonts() {
        return [...this.getBundledFonts(), ...this.getSystemFonts()];
    },
    
    /**
     * Get fonts by category
     * @param {string} category - Category to filter by
     * @returns {Array} - Array of font objects
     */
    getFontsByCategory(category) {
        if (!category || category === 'all') {
            return this.getAllFonts();
        }
        
        return this.getAllFonts().filter(font => font.category === category);
    },
    
    /**
     * Get a font by family name
     * @param {string} family - Font family name
     * @returns {Object|null} - Font object or null if not found
     */
    getFontByFamily(family) {
        return this.getAllFonts().find(font => 
            font.family === family || font.displayName === family
        ) || null;
    }
};

// Make it available globally for backward compatibility
window.LocalFontsCollection = LocalFontsCollection;

// Export for ES modules
export default LocalFontsCollection; 