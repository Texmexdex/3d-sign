import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import FontManager from './fontManager.js';
import SvgProcessor from './svgProcessor.js';
import ModelGenerator from './modelGenerator.js';
import PreviewRenderer from './previewRenderer.js';
import ExportManager from './exportManager.js';

// AR variables
let arSession = null;
let arController = null;
let arReticle = null;
let hitTestSource = null;
let hitTestSourceRequested = false;
let modelToPlaceAR = null;
let currentPreviewRenderer = null;

// Animated particles background
let particleSystem;
const particles = [];
const NUM_PARTICLES = 150;

/**
 * Main Application
 * Initializes and coordinates the components of the 3D Font Generator
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const fontManager = new FontManager();
    const svgProcessor = new SvgProcessor();
    const modelGenerator = new ModelGenerator();
    const previewRenderer = new PreviewRenderer('preview-container');
    const exportManager = new ExportManager(svgProcessor, modelGenerator);
    
    // Store previewRenderer for AR
    currentPreviewRenderer = previewRenderer;
    
    // Global variables to store current state
    window.currentPathData = null;
    window.currentModel = null;
    window.designMode = 'text'; // 'text' or 'svg'
    
    // Initialize UI event listeners
    initializeUI(fontManager, svgProcessor, modelGenerator, previewRenderer, exportManager);
    
    // Setup animated background
    setupAnimatedBackground();
    
    // Initial preview generation
    setTimeout(() => {
        updatePreview(fontManager, modelGenerator, previewRenderer);
    }, 1000); // Wait for fonts to load
    
    // Check AR availability
    checkARAvailability();
});

/**
 * Initialize all UI elements and event listeners
 */
function initializeUI(fontManager, svgProcessor, modelGenerator, previewRenderer, exportManager) {
    // Input elements
    const textInput = document.getElementById('text-input');
    const letterSpacingInput = document.getElementById('letter-spacing');
    const letterSpacingValue = document.getElementById('letter-spacing-value');
    const extrusionDepthInput = document.getElementById('extrusion-depth');
    const extrusionDepthValue = document.getElementById('extrusion-depth-value');
    const dynamicDepthInput = document.getElementById('dynamic-depth');
    const bevelEnabledInput = document.getElementById('bevel-enabled');
    const frontColorInput = document.getElementById('front-color');
    const sideColorInput = document.getElementById('side-color');
    const updatePreviewButton = document.getElementById('update-preview');
    const svgUploadInput = document.getElementById('svg-upload');
    const askQuoteBtn = document.getElementById('ask-quote-btn');
    const quoteForm = document.getElementById('quote-form');
    
    // UI animation elements
    const inputPanelItems = document.querySelectorAll('.input-panel > *');
    animateUIElements(inputPanelItems);
    
    // Set default colors
    frontColorInput.value = "#ffffff"; // White for front
    sideColorInput.value = "#000000"; // Black for sides
    
    // Apply the color setting to the previewRenderer
    previewRenderer.frontColor = frontColorInput.value;
    
    // Get AR UI elements
    const arContainerWrapper = document.getElementById('ar-container-wrapper');
    const arUiContainer = document.getElementById('ui-container');
    const arInfoMessage = document.getElementById('info-message');
    const viewInARButton = document.getElementById('view-in-ar-button');
    const arExitButton = document.getElementById('ar-exit-button');
    
    // Add event listeners for color pickers
    const colorPickerContainers = document.querySelectorAll('.color-picker-container');
    colorPickerContainers.forEach(container => {
        const colorInput = container.querySelector('input[type="color"]');
        const colorValue = container.querySelector('.color-value');
        
        if (colorInput && colorValue) {
            // Initial value
            colorValue.textContent = colorInput.value;
            
            // Update on change
            colorInput.addEventListener('input', () => {
                colorValue.textContent = colorInput.value;
                updateModelColors(previewRenderer, frontColorInput, sideColorInput);
            });
        }
    });
    
    // File upload styling
    if (svgUploadInput) {
        const fileUploadLabel = document.querySelector('.file-upload-label');
        
        svgUploadInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                fileUploadLabel.innerHTML = `<i class="ri-file-line"></i><span>${fileName}</span>`;
            } else {
                fileUploadLabel.innerHTML = `<i class="ri-upload-cloud-line"></i><span>Choose a file or drag it here</span>`;
            }
        });
    }
    
    // Update values display for range inputs
    extrusionDepthInput.addEventListener('input', () => {
        extrusionDepthValue.textContent = `${extrusionDepthInput.value}mm`;
    });
    
    letterSpacingInput.addEventListener('input', () => {
        letterSpacingValue.textContent = `${letterSpacingInput.value}px`;
    });
    
    // Event listener for font changes
    document.addEventListener('fontChanged', () => {
        // Switch to text mode when font is changed
        window.designMode = 'text';
        updatePreview(fontManager, modelGenerator, previewRenderer);
    });
    
    // Event listener for SVG uploads
    document.addEventListener('svgUploaded', (event) => {
        // Switch to SVG mode when an SVG is uploaded
        window.designMode = 'svg';
        window.currentPathData = event.detail;
        updatePreview(fontManager, modelGenerator, previewRenderer);
    });
    
    // Event listener for the update preview button
    updatePreviewButton.addEventListener('click', () => {
        updatePreview(fontManager, modelGenerator, previewRenderer);
    });
    
    // Handle Quote Request form submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(quoteForm);
            
            // Get current 3D settings
            const settings = get3DSettings(
                extrusionDepthInput, 
                dynamicDepthInput, 
                bevelEnabledInput,
                frontColorInput,
                sideColorInput,
                letterSpacingInput
            );
            
            // Add design mode to settings
            settings.designMode = window.designMode;
            settings.font = document.querySelector('#font-selector')?.value || 'Default';
            
            // Send quote request
            exportManager.sendQuoteRequest(
                previewRenderer.getCurrentModel(),
                settings,
                textInput.value,
                formData.get('email'),
                formData.get('name'),
                formData.get('notes')
            );
            
            // Close the modal
            document.getElementById('quote-modal').classList.remove('active');
        });
    }
    
    // Handle opening the quote form modal
    if (askQuoteBtn) {
        askQuoteBtn.addEventListener('click', () => {
            document.getElementById('quote-modal').classList.add('active');
        });
    }
    
    // Handle closing the quote form modal
    document.querySelectorAll('.modal-close, .modal-bg').forEach(elem => {
        elem.addEventListener('click', (e) => {
            if (e.target === elem) {
                document.getElementById('quote-modal').classList.remove('active');
            }
        });
    });
    
    // AR button event listeners
    if (viewInARButton) {
        viewInARButton.addEventListener('click', () => startAR(previewRenderer));
    }
    
    if (arExitButton) {
        arExitButton.addEventListener('click', endARSession);
    }
    
    // Handle text input animations
    if (textInput) {
        textInput.addEventListener('focus', () => {
            document.querySelector('.text-input-container').classList.add('focused');
        });
        
        textInput.addEventListener('blur', () => {
            document.querySelector('.text-input-container').classList.remove('focused');
        });
    }
    
    // Handle panel toggling for mobile
    const panelToggles = document.querySelectorAll('.panel-toggle');
    panelToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const panel = toggle.closest('.panel');
            panel.classList.toggle('collapsed');
        });
    });
    
    // Reset camera button
    document.getElementById('reset-camera')?.addEventListener('click', () => {
        previewRenderer.resetCamera();
    });
    
    // Add interaction animations
    addInteractionAnimations();
}

/**
 * Add subtle animations to interactive elements
 */
function addInteractionAnimations() {
    // Button hover animations
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });
    
    // Slider animation
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', () => {
            const ripple = document.createElement('div');
            ripple.classList.add('slider-ripple');
            slider.parentNode.appendChild(ripple);
            
            const rect = slider.getBoundingClientRect();
            const value = (slider.value - slider.min) / (slider.max - slider.min);
            ripple.style.left = `${value * rect.width}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/**
 * Animate UI elements with staggered entrance
 */
function animateUIElements(elements) {
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + index * 50);
    });
}

/**
 * Setup animated particles background
 */
function setupAnimatedBackground() {
    // Get the particles container
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Create particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;
        
        // Random size
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;
        particle.style.opacity = opacity;
        
        // Random duration and delay
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        // Add to container
        container.appendChild(particle);
        particles.push({
            element: particle,
            x, y,
            vx: Math.random() * 0.2 - 0.1,
            vy: Math.random() * 0.2 - 0.1
        });
    }
    
    // Add mouse move effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        particles.forEach(particle => {
            const distX = mouseX - (particle.x / 100);
            const distY = mouseY - (particle.y / 100);
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < 0.3) {
                const force = 0.3 - distance;
                particle.vx -= distX * force * 0.02;
                particle.vy -= distY * force * 0.02;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Add friction
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            
            // Boundary check
            if (particle.x < 0) particle.x = 0;
            if (particle.x > 100) particle.x = 100;
            if (particle.y < 0) particle.y = 0;
            if (particle.y > 100) particle.y = 100;
            
            // Apply position
            particle.element.style.left = `${particle.x}vw`;
            particle.element.style.top = `${particle.y}vh`;
        });
    });
}

/**
 * Update the preview based on current settings
 */
function updatePreview(fontManager, modelGenerator, previewRenderer) {
    // Show loading indicator
    document.getElementById('loading-indicator').classList.remove('hidden');
    
    try {
        // Get input values
        const textInput = document.getElementById('text-input');
        const letterSpacingInput = document.getElementById('letter-spacing');
        
        // Generate path data based on design mode
        if (window.designMode === 'text') {
            const text = textInput.value || 'Hello';
            const letterSpacing = parseFloat(letterSpacingInput.value);
            window.currentPathData = fontManager.generateTextPath(text, 72, letterSpacing);
        }
        
        // Check if we have valid path data
        if (!window.currentPathData || !window.currentPathData.paths || window.currentPathData.paths.length === 0) {
            throw new Error('No valid path data');
        }
        
        // Get 3D settings
        const settings = get3DSettings(
            document.getElementById('extrusion-depth'),
            document.getElementById('dynamic-depth'),
            document.getElementById('bevel-enabled'),
            document.getElementById('front-color'),
            document.getElementById('side-color'),
            document.getElementById('letter-spacing')
        );
        
        // Generate 3D model
        window.currentModel = modelGenerator.generateModelFromPaths(window.currentPathData, settings);
        
        // Update the preview
        previewRenderer.updateModel(window.currentModel);
        
        // Hide loading indicator
        document.getElementById('loading-indicator').classList.add('hidden');
        
    } catch (error) {
        console.error('Error updating preview:', error);
        document.getElementById('loading-indicator').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('error-message').classList.add('hidden');
        }, 3000);
    }
}

/**
 * Update model colors without regenerating the geometry
 */
function updateModelColors(previewRenderer, frontColorInput, sideColorInput) {
    const colorSettings = {
        frontColor: frontColorInput.value,
        sideColor: sideColorInput.value 
    };
    
    previewRenderer.updateModelColors(colorSettings);
}

/**
 * Get current 3D settings from the UI
 */
function get3DSettings(extrusionDepthInput, dynamicDepthInput, bevelEnabledInput, frontColorInput, sideColorInput, letterSpacingInput) {
    return {
        extrusionDepth: parseFloat(extrusionDepthInput.value),
        dynamicDepth: dynamicDepthInput.checked,
        bevelEnabled: bevelEnabledInput.checked,
        bevelThickness: 1,
        bevelSize: 0.5,
        bevelSegments: 3,
        frontColor: frontColorInput.value,
        sideColor: sideColorInput.value,
        outlineColor: '#000000',
        outlineThickness: 0,  // No outline by default
        letterSpacing: parseFloat(letterSpacingInput.value)
    };
}

/**
 * Check if AR is available on this device
 */
function checkARAvailability() {
    if (!navigator.xr) {
        console.warn('WebXR not supported by this browser');
        document.getElementById('view-in-ar-button').classList.add('disabled');
        document.getElementById('view-in-ar-button').title = 'AR not supported on this device';
        return;
    }
    
    navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => {
            if (!supported) {
                document.getElementById('view-in-ar-button').classList.add('disabled');
                document.getElementById('view-in-ar-button').title = 'AR not supported on this device';
            }
        })
        .catch(err => {
            console.error('Error checking AR support:', err);
            document.getElementById('view-in-ar-button').classList.add('disabled');
            document.getElementById('view-in-ar-button').title = 'Error checking AR support';
        });
}

/**
 * Prepare model for AR display
 */
function prepareModelForAR() {
    if (!window.currentModel) {
        console.error("No current model to prepare for AR.");
        document.getElementById('info-message').textContent = "Please generate a design first.";
        document.getElementById('info-message').style.display = 'block';
        return false;
    }

    modelToPlaceAR = window.currentModel.clone(); // Clone to avoid affecting the main preview

    // --- Center and Scale the model for AR ---
    const box = new THREE.Box3().setFromObject(modelToPlaceAR);
    const center = new THREE.Vector3();
    box.getCenter(center);
    modelToPlaceAR.position.sub(center); // Center the model at its origin

    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 0.3; // Target size in meters (e.g., 30cm)

    if (maxDim > 0) {
        const scale = desiredSize / maxDim;
        modelToPlaceAR.scale.set(scale, scale, scale);
    } else { // Handle case where model has no size (e.g. empty)
        modelToPlaceAR.scale.set(1,1,1); // Default scale
    }

    console.log("Model prepared for AR:", modelToPlaceAR);
    return true;
}

/**
 * Start AR session
 */
async function startAR(previewRenderer) {
    if (!previewRenderer || !previewRenderer.renderer) {
        console.error("PreviewRenderer not ready.");
        return;
    }

    if (!prepareModelForAR()) { // Prepare the model first
        return; // Stop if model preparation failed
    }

    if (navigator.xr) {
        try {
            // DOM Overlay feature requires the UI elements to be within the specified root.
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'dom-overlay'],
                domOverlay: { root: document.getElementById('ar-container-wrapper') }
            });
            onSessionStartedAR(session, previewRenderer);
        } catch (e) {
            console.error("Failed to start AR session:", e);
            document.getElementById('info-message').textContent = "Failed to start AR. Ensure WebXR is supported and camera permissions are granted. Error: " + e.message;
            document.getElementById('info-message').style.display = 'block';
            setTimeout(() => { document.getElementById('info-message').style.display = 'none'; }, 5000);
        }
    } else {
        console.warn("WebXR not supported.");
        document.getElementById('info-message').textContent = "WebXR not supported on this browser/device.";
        document.getElementById('info-message').style.display = 'block';
        setTimeout(() => { document.getElementById('info-message').style.display = 'none'; }, 5000);
    }
}

/**
 * Handle AR session start
 */
function onSessionStartedAR(newSession, previewRenderer) {
    arSession = newSession;
    arSession.addEventListener('end', onSessionEndedAR);

    previewRenderer.renderer.xr.setSession(arSession);

    // UI Updates
    document.getElementById('ar-container-wrapper').style.display = 'block'; // Show AR container
    document.querySelector('.container').style.display = 'none'; // Hide main app
    document.getElementById('ar-exit-button').style.display = 'block';
    document.getElementById('info-message').textContent = "Move phone to find a surface. Tap to place.";
    document.getElementById('info-message').style.display = 'block';

    previewRenderer.pauseAnimation(); // Pause the 2D preview animation

    // Reticle Setup (3D Ring)
    if (!arReticle) {
        arReticle = new THREE.Mesh(
            new THREE.RingGeometry(0.05, 0.07, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true })
        );
        arReticle.matrixAutoUpdate = false;
        arReticle.visible = false;
        previewRenderer.scene.add(arReticle); // Add to the main scene
    } else { // Ensure reticle is visible if re-entering AR
         arReticle.visible = false; // Start hidden until hit-test
    }

    // Controller for Tap Input
    if (arController) { // Clean up previous if any (shouldn't happen if session end is clean)
        arController.removeEventListener('select', onSelectAR);
        previewRenderer.scene.remove(arController);
    }
    arController = previewRenderer.renderer.xr.getController(0);
    arController.addEventListener('select', onSelectAR);
    previewRenderer.scene.add(arController);

    hitTestSourceRequested = false; // Reset for new session
    hitTestSource = null;

    // Start the AR render loop (using the existing renderer and scene)
    previewRenderer.renderer.setAnimationLoop((timestamp, frame) => renderXRSession(timestamp, frame, previewRenderer));
    console.log("AR Session Started");
}

/**
 * Handle tap to place in AR
 */
function onSelectAR() {
    if (arReticle && arReticle.visible && modelToPlaceAR) {
        const newSignAR = modelToPlaceAR.clone(); // Clone the prepared model
        newSignAR.position.setFromMatrixPosition(arReticle.matrix);
        newSignAR.visible = true;
        newSignAR.userData.isARPlacedObject = true; // Mark for cleanup
        currentPreviewRenderer.scene.add(newSignAR);
        console.log("AR Sign placed at:", newSignAR.position);
    }
}

/**
 * AR render loop
 */
function renderXRSession(timestamp, frame, previewRenderer) {
    if (!frame || !arSession) return;

    const referenceSpace = previewRenderer.renderer.xr.getReferenceSpace();

    if (!referenceSpace) {
        console.warn("AR Reference space not yet available.");
        return;
    }

    // Hit Testing
    if (!hitTestSourceRequested) {
        arSession.requestReferenceSpace('viewer').then((viewerSpace) => {
            // Ensure viewerSpace is not null before requesting hit test source
            if (viewerSpace) {
                arSession.requestHitTestSource({ space: viewerSpace }).then((source) => {
                    hitTestSource = source;
                    console.log("Hit test source obtained.");
                }).catch(err => {
                     console.error("Could not get hit test source:", err);
                     hitTestSourceRequested = false; // Allow retry
                });
            } else {
                console.error("Viewer reference space is null.");
                hitTestSourceRequested = false; // Allow retry
            }
        }).catch(err => {
            console.error("Could not get viewer reference space for hit test:", err);
            hitTestSourceRequested = false; // Allow retry
        });
        hitTestSourceRequested = true; // Set true once request is made
    }

    if (hitTestSource && arReticle) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const hitPose = hit.getPose(referenceSpace);

            if (hitPose) {
                arReticle.visible = true;
                arReticle.matrix.fromArray(hitPose.transform.matrix);
            } else {
                arReticle.visible = false;
            }
        } else {
            arReticle.visible = false;
        }
    }
}

/**
 * End the AR session
 */
function endARSession() {
    if (arSession) {
        arSession.end().catch(e => console.error("Error ending AR session:", e));
        // onSessionEndedAR will handle the rest via the 'end' event
    }
}

/**
 * Handle AR session end
 */
function onSessionEndedAR() {
    if (arController) {
        arController.removeEventListener('select', onSelectAR);
        // Check if arController is still a child of the scene before removing
        if (arController.parent === currentPreviewRenderer.scene) {
            currentPreviewRenderer.scene.remove(arController);
        }
        arController = null;
    }
    if (arReticle) {
        arReticle.visible = false;
    }

    // Remove placed AR objects
    const objectsToRemove = [];
    currentPreviewRenderer.scene.traverse(child => {
        if (child.userData.isARPlacedObject) {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(obj => {
        if (obj.parent === currentPreviewRenderer.scene) {
            currentPreviewRenderer.scene.remove(obj);
        }
        // Dispose of geometry and material if necessary to free memory
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });

    hitTestSourceRequested = false;
    hitTestSource = null;

    // Clear the XR session from the renderer
    if (currentPreviewRenderer && currentPreviewRenderer.renderer.xr.getSession()) {
         currentPreviewRenderer.renderer.xr.setSession(null).catch(e => console.error("Error setting XR session to null:", e));
    }

    currentPreviewRenderer.renderer.setAnimationLoop(null); // Stop the AR render loop

    // UI Updates
    document.getElementById('ar-container-wrapper').style.display = 'none';
    document.querySelector('.container').style.display = 'block'; // Show main app
    document.getElementById('ar-exit-button').style.display = 'none';
    document.getElementById('info-message').style.display = 'none';

    currentPreviewRenderer.resumeAnimation(); // Resume the 2D preview animation

    arSession = null; // Clear the session variable
    console.log("AR Session Ended");
}