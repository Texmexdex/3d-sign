import * as THREE from 'three';
import FontManager from './fontManager.js';
import SvgProcessor from './svgProcessor.js';
import ModelGenerator from './modelGenerator.js';
import PreviewRenderer from './previewRenderer.js';
import ExportManager from './exportManager.js';

// AR variables
let arSession = null;
let arController = null;
let arReticle = null; // This will be our 3D reticle object
let hitTestSource = null;
let hitTestSourceRequested = false;
let modelToPlaceAR = null; // This will hold the sign model prepared for AR

// Reference to previewRenderer instance, will be set in DOMContentLoaded
let currentPreviewRenderer = null;

/**
 * Main Application
 * Initializes and coordinates the components of the 3D Sign Creator
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
    
    // Input elements
    const textInput = document.getElementById('text-input');
    // Create virtual outline elements since they were removed from UI
    const outlineColor = '#000000';
    const outlineThickness = 20;
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
    
    // Set default colors
    frontColorInput.value = "#ffffff"; // White for front
    sideColorInput.value = "#000000"; // Black for sides
    
    // Apply the color setting to the previewRenderer
    previewRenderer.frontColor = frontColorInput.value;
    
    // Hide the side color input group since we're making all sides black
    const sideColorGroup = sideColorInput.closest('.input-group');
    if (sideColorGroup) {
        sideColorGroup.style.display = 'none';
    }
    
    // Add a retro theme toggle
    const themeToggle = document.createElement('button');
    themeToggle.className = 'btn';
    themeToggle.innerHTML = '<i class="ri-sun-line"></i> Toggle Light Mode';
    themeToggle.style.marginTop = '20px';
    document.querySelector('.export-options').after(themeToggle);
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });
    
    // Get AR UI elements
    const arContainerWrapper = document.getElementById('ar-container-wrapper');
    const arUiContainer = document.getElementById('ui-container');
    const arInfoMessage = document.getElementById('info-message');
    const viewInARButton = document.getElementById('view-in-ar-button');
    const arExitButton = document.getElementById('ar-exit-button');
    
    // Add event listeners for AR buttons
    viewInARButton.addEventListener('click', startAR);
    arExitButton.addEventListener('click', endARSession);
    
    // Color display elements
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
        updatePreview();
    });
    
    // Event listener for SVG uploads
    document.addEventListener('svgUploaded', (event) => {
        // Switch to SVG mode when an SVG is uploaded
        window.designMode = 'svg';
        window.currentPathData = event.detail;
        updatePreview();
    });
    
    // Event listener for color changes (real-time update without regenerating geometry)
    frontColorInput.addEventListener('input', updateModelColors);
    
    // Event listener for the update preview button
    updatePreviewButton.addEventListener('click', updatePreview);
    
    // Event listeners for export buttons
    document.getElementById('download-svg').addEventListener('click', () => {
        exportManager.exportSVG();
    });
    
    document.getElementById('download-stl').addEventListener('click', () => {
        exportManager.exportSTL(previewRenderer.getCurrentModel());
    });
    
    /**
     * Update the preview based on current settings
     */
    function updatePreview() {
        // Show loading indicator
        document.getElementById('loading-indicator').classList.remove('hidden');
        
        try {
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
            const settings = get3DSettings();
            
            // Generate 3D model
            window.currentModel = modelGenerator.generateModelFromPaths(window.currentPathData, settings);
            
            // Update the preview (this will apply the color from the previewRenderer.frontColor)
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
    function updateModelColors() {
        const colorSettings = {
            frontColor: frontColorInput.value,
            // We're ignoring the side color since all sides are black
            sideColor: '#000000' 
        };
        
        previewRenderer.updateModelColors(colorSettings);
    }
    
    /**
     * Get current 3D settings from the UI
     * @returns {Object} - 3D settings object
     */
    function get3DSettings() {
        return {
            extrusionDepth: parseFloat(extrusionDepthInput.value),
            dynamicDepth: dynamicDepthInput.checked,
            bevelEnabled: bevelEnabledInput.checked,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3,
            frontColor: frontColorInput.value,
            sideColor: '#000000', // Always black sides
            outlineColor: outlineColor,
            outlineThickness: outlineThickness,
            letterSpacing: parseFloat(letterSpacingInput.value)
        };
    }
    
    // Initial preview generation
    setTimeout(() => {
        updatePreview();
    }, 1000); // Wait for fonts to load
});

/**
 * Prepare model for AR display
 * Scale and position the model for AR placement
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
async function startAR() {
    if (!currentPreviewRenderer || !currentPreviewRenderer.renderer) {
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
            onSessionStartedAR(session);
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
 * @param {XRSession} newSession - The new AR session
 */
function onSessionStartedAR(newSession) {
    arSession = newSession;
    arSession.addEventListener('end', onSessionEndedAR);

    currentPreviewRenderer.renderer.xr.setSession(arSession);

    // UI Updates
    document.getElementById('ar-container-wrapper').style.display = 'block'; // Show AR container
    document.querySelector('.container').style.display = 'none'; // Hide main app
    document.getElementById('ar-exit-button').style.display = 'block';
    document.getElementById('info-message').textContent = "Move phone to find a surface. Tap to place.";
    document.getElementById('info-message').style.display = 'block';

    currentPreviewRenderer.pauseAnimation(); // Pause the 2D preview animation

    // Reticle Setup (3D Ring)
    if (!arReticle) {
        arReticle = new THREE.Mesh(
            new THREE.RingGeometry(0.05, 0.07, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true })
        );
        arReticle.matrixAutoUpdate = false;
        arReticle.visible = false;
        currentPreviewRenderer.scene.add(arReticle); // Add to the main scene
    } else { // Ensure reticle is visible if re-entering AR
         arReticle.visible = false; // Start hidden until hit-test
    }

    // Controller for Tap Input
    if (arController) { // Clean up previous if any (shouldn't happen if session end is clean)
        arController.removeEventListener('select', onSelectAR);
        currentPreviewRenderer.scene.remove(arController);
    }
    arController = currentPreviewRenderer.renderer.xr.getController(0);
    arController.addEventListener('select', onSelectAR);
    currentPreviewRenderer.scene.add(arController);

    hitTestSourceRequested = false; // Reset for new session
    hitTestSource = null;

    // Start the AR render loop (using the existing renderer and scene)
    currentPreviewRenderer.renderer.setAnimationLoop(renderXRSession);
    console.log("AR Session Started");
}

/**
 * Handle tap to place in AR
 */
function onSelectAR() {
    if (arReticle && arReticle.visible && modelToPlaceAR) {
        const newSignAR = modelToPlaceAR.clone(); // Clone the prepared model
        newSignAR.position.setFromMatrixPosition(arReticle.matrix);
        // Optional: Apply a slight rotation if needed, e.g., to face the camera
        // newSignAR.quaternion.copy(currentPreviewRenderer.camera.quaternion); // Simplistic face camera
        // newSignAR.rotation.y = ... // or set a specific rotation
        newSignAR.visible = true;
        newSignAR.userData.isARPlacedObject = true; // Mark for cleanup
        currentPreviewRenderer.scene.add(newSignAR);
        console.log("AR Sign placed at:", newSignAR.position);
    }
}

/**
 * AR render loop
 * @param {DOMHighResTimeStamp} timestamp - The time when FUN was called
 * @param {XRFrame} frame - The current XR frame
 */
function renderXRSession(timestamp, frame) {
    if (!frame || !arSession) return;

    const referenceSpace = currentPreviewRenderer.renderer.xr.getReferenceSpace();

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
    // The renderer's own loop will render scene and camera
    // No explicit call to currentPreviewRenderer.renderer.render() here if using setAnimationLoop
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
        // Optionally remove from scene if you re-create it each time:
        // if (arReticle.parent === currentPreviewRenderer.scene) {
        //     currentPreviewRenderer.scene.remove(arReticle);
        // }
        // arReticle = null; // Keep the reticle object for reuse
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

    // Important: Clear the XR session from the renderer
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