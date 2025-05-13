import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * Preview Renderer
 * Handles the 3D preview of the model using Three.js
 */
class PreviewRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null; // Effect composer for post-processing
        this.controls = null;
        this.currentModel = null;
        this.wireframeMode = false;
        this.frontColor = "#ffffff"; // Default front face color
        this.animationFrameId = null;
        this.bloomStrength = 0.3; // Further reduced strength
        this.bloomRadius = 0.2; // Keep sharp radius
        this.bloomThreshold = 0.4; // Increased threshold to reduce bloom spread
        
        // Effect settings
        this.effects = {
            bloom: {
                enabled: true,
                strength: this.bloomStrength,
                radius: this.bloomRadius,
                threshold: this.bloomThreshold
            },
            rotation: {
                enabled: false,
                speed: 0.01
            },
            pulse: {
                enabled: false,
                speed: 0.05,
                min: 0.5,
                max: 1.0,
                value: 0.8
            }
        };
        
        this.initRenderer();
        this.setupPostProcessing();
        this.animate();
        this.handleResize();
        this.initControlButtons();
        this.createEffectsPanel();
    }

    /**
     * Initialize the Three.js renderer
     */
    initRenderer() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Use a simpler gradient background approach
        this.createNightSkyBackground();
        
        // Create camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
        this.camera.position.set(0, 0, 400);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = false; // Disable shadows completely
        this.renderer.xr.enabled = true; // Enable WebXR
        this.container.appendChild(this.renderer.domElement);
        
        // Create orbit controls for camera
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.5;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.update();
        
        // Add lights
        this.addLights();
        
        // Note: Ground plane removed to eliminate reflection
    }
    
    /**
     * Create a night sky background using a simpler approach
     */
    createNightSkyBackground() {
        // Use dark space color for the entire background
        const spaceColor = new THREE.Color(0x000011); // Dark space blue
        
        // Create a large dome for the sky
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            color: spaceColor,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        // Add stars to the entire night sky
        this.addStars();
        
        // Water surface removed
    }
    
    /**
     * Add stars to the night sky
     */
    addStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: false
        });
        
        // Generate random stars positions throughout the entire sphere
        const starVertices = [];
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000; // Stars everywhere (not just upper hemisphere)
            const z = (Math.random() - 0.5) * 2000;
            
                starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        
        // Create a few larger, brighter stars
        const brightStarMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            transparent: true,
            opacity: 1.0,
            sizeAttenuation: false
        });
        
        const brightStarVertices = [];
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000; // Throughout the sphere
            const z = (Math.random() - 0.5) * 2000;
            brightStarVertices.push(x, y, z);
        }
        
        const brightStarGeometry = new THREE.BufferGeometry();
        brightStarGeometry.setAttribute('position', new THREE.Float32BufferAttribute(brightStarVertices, 3));
        const brightStars = new THREE.Points(brightStarGeometry, brightStarMaterial);
        this.scene.add(brightStars);
        
        // Add a moon
        this.addMoon();
    }
    
    /**
     * Add a moon to the night sky
     */
    addMoon() {
        const moonGeometry = new THREE.SphereGeometry(30, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(-300, 300, -500); // Position in upper left quadrant
        this.scene.add(moon);
        
        // Add glow around the moon
        const moonGlowGeometry = new THREE.SphereGeometry(35, 32, 32);
        const moonGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xCCDDFF,
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide
        });
        
        const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
        moonGlow.position.copy(moon.position);
        this.scene.add(moonGlow);
        
        // Add a subtle light from the moon's position
        const moonLight = new THREE.PointLight(0xCCDDFF, 0.8, 1000);
        moonLight.position.copy(moon.position);
        this.scene.add(moonLight);
    }

    /**
     * Initialize control buttons functionality
     */
    initControlButtons() {
        // Handle reset camera button
        const resetCameraButton = document.getElementById('reset-camera');
        if (resetCameraButton) {
            resetCameraButton.addEventListener('click', () => {
                this.resetCameraView();
            });
        }
        
        // Handle toggle wireframe button
        const toggleWireframeButton = document.getElementById('toggle-wireframe');
        if (toggleWireframeButton) {
            toggleWireframeButton.addEventListener('click', () => {
                this.toggleWireframe();
            });
        }
        
        // Add fullscreen button
        const previewPanel = document.querySelector('.preview-panel');
        if (previewPanel) {
            const fullscreenButton = document.createElement('button');
            fullscreenButton.id = 'fullscreen-button';
            fullscreenButton.className = 'control-btn';
            fullscreenButton.title = 'Toggle Fullscreen';
            fullscreenButton.innerHTML = '<i class="ri-fullscreen-line"></i>';
            
            const previewControls = previewPanel.querySelector('.preview-controls');
            if (previewControls) {
                previewControls.appendChild(fullscreenButton);
                
                fullscreenButton.addEventListener('click', () => {
                    this.toggleFullscreen();
                });
            }
        }
    }

    /**
     * Toggle fullscreen mode for the preview container
     */
    toggleFullscreen() {
        const previewPanel = document.querySelector('.preview-panel');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (previewPanel.requestFullscreen) {
                previewPanel.requestFullscreen();
            } else if (previewPanel.webkitRequestFullscreen) {
                previewPanel.webkitRequestFullscreen();
            } else if (previewPanel.msRequestFullscreen) {
                previewPanel.msRequestFullscreen();
            }
            
            // Update button icon
            const fullscreenButton = document.getElementById('fullscreen-button');
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Update button icon
            const fullscreenButton = document.getElementById('fullscreen-button');
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-line"></i>';
            }
        }
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.handleResize();
            this.updateFullscreenButton();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleResize();
            this.updateFullscreenButton();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.handleResize();
            this.updateFullscreenButton();
        });
    }
    
    /**
     * Update fullscreen button icon based on current state
     */
    updateFullscreenButton() {
        const fullscreenButton = document.getElementById('fullscreen-button');
        if (fullscreenButton) {
            if (document.fullscreenElement) {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
            } else {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-line"></i>';
            }
        }
    }
    
    /**
     * Add lights to the scene
     */
    addLights() {
        // Ambient light - subtle overall illumination
        const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
        this.scene.add(ambientLight);
        
        // Add main spotlight from front-top with moderate intensity
        const mainSpotLight = new THREE.SpotLight(0xffffff, 0.6);
        mainSpotLight.position.set(0, 200, 300);
        mainSpotLight.angle = Math.PI / 5;
        mainSpotLight.penumbra = 0.5;
        mainSpotLight.decay = 1.5;
        mainSpotLight.distance = 1000;
        mainSpotLight.castShadow = false;
        this.scene.add(mainSpotLight);
        
        // Add a subtle blue rim light from behind
        const rimLight = new THREE.DirectionalLight(0x6070ff, 0.3);
        rimLight.position.set(0, 100, -200);
        this.scene.add(rimLight);
        
        // Very subtle side lights
        const rightLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rightLight.position.set(200, 50, 100);
        this.scene.add(rightLight);
        
        const leftLight = new THREE.DirectionalLight(0xffffff, 0.2);
        leftLight.position.set(-200, 50, 100);
        this.scene.add(leftLight);
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            
            this.renderer.setSize(width, height);
            
            // Update composer size if it exists
            if (this.composer) {
                this.composer.setSize(width, height);
            }
        });
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Apply rotation effect if enabled
        if (this.effects.rotation.enabled && this.currentModel) {
            this.currentModel.rotation.y += this.effects.rotation.speed;
        }
        
        // Apply pulse effect if enabled
        if (this.effects.pulse.enabled && this.currentModel) {
            // Calculate pulse value based on sine wave
            const pulse = this.effects.pulse;
            const pulseRange = pulse.max - pulse.min;
            const pulseValue = pulse.min + (Math.sin(Date.now() * pulse.speed * 0.001) + 1) / 2 * pulseRange;
            
            // Update material emissive intensity
            this.currentModel.traverse(child => {
                if (child.isMesh && Array.isArray(child.material)) {
                    if (child.material[0] && child.material[0].emissiveIntensity !== undefined) {
                        child.material[0].emissiveIntensity = pulseValue;
                    }
                }
            });
            
            // Store current pulse value
            pulse.value = pulseValue;
        }
        
        // Render using the post-processing composer instead of direct renderer
        if (this.composer && !this.renderer.xr.isPresenting) {
            this.composer.render();
        } else {
            // Fallback to regular rendering when composer isn't available or in XR mode
        this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Pause the animation loop
     */
    pauseAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log("PreviewRenderer animation paused");
        }
    }
    
    /**
     * Resume the animation loop
     */
    resumeAnimation() {
        if (!this.animationFrameId && (!this.renderer.xr || !this.renderer.xr.isPresenting)) { // Only resume if not in AR
            this.animate();
            console.log("PreviewRenderer animation resumed");
        }
    }

    /**
     * Update the 3D model in the preview
     * @param {THREE.Group} model - The new model to display
     */
    updateModel(model) {
        // Remove the current model if it exists
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        
        // Remove any existing lighting effects
        if (this.illuminationEffect) {
            this.scene.remove(this.illuminationEffect);
            this.illuminationEffect = null;
        }
        
        // Add the new model
        if (model) {
            this.currentModel = model;
            
            // Keep the model at the center of the scene
            this.currentModel.position.set(0, 0, 0);
            
            // Create illuminated front face material with moderate emissive glow and sharp edges
            const frontMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff, // Always white
                metalness: 0.1,
                roughness: 0.05, // Reduced roughness for crisper edges
                reflectivity: 0.8,
                emissive: 0xffffff, // Also white emissive for default
                emissiveIntensity: 0.8, // Moderate intensity for less overall brightness
                clearcoat: 1.0,
                clearcoatRoughness: 0 // Completely smooth clearcoat for crisp reflections
            });
            
            // Glossy black side material with high reflectivity for sides and back
            const blackSideMaterial = new THREE.MeshPhysicalMaterial({ 
                color: 0x000000,
                metalness: 1.0, // Fully metallic for sharper edges
                roughness: 0.05, // Very smooth
                reflectivity: 1.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0 // Completely smooth clearcoat
            });
            
            // Apply materials to all meshes
            this.currentModel.traverse(child => {
                if (child.isMesh) {
                    // If it's an array of materials
                    if (Array.isArray(child.material)) {
                        // Make a copy of current materials to avoid reference issues
                        const materials = [];
                        
                        // In the extruded text geometry:
                        // - Index 0 is the front/back face material
                        // - Index 1 is the side material (extrusion)
                        for (let i = 0; i < child.material.length; i++) {
                            if (i === 0) {
                                // Front face - illuminated with strong emission
                                materials.push(frontMaterial);
                            } else {
                                // All other faces - highly glossy black
                                materials.push(blackSideMaterial);
                            }
                        }
                        
                        child.material = materials;
                    }
                    
                    // Disable all shadow casting and receiving
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            });
            
            // Add the model to the scene
            this.scene.add(this.currentModel);
            
            // Add direct illumination effects
            this.addIlluminationEffect();
            
            // Reset camera position for a good view of the model
            this.resetCameraView();
        }
    }
    
    /**
     * Add illumination effect to highlight the front faces
     */
    addIlluminationEffect() {
        if (!this.currentModel) return;
        
        // Get the base color from the current front color
        let illuminationColor;
        if (this.frontColor && this.frontColor !== "#ffffff") {
            // Use the selected front color for illumination
            illuminationColor = new THREE.Color(this.frontColor);
            
            // Calculate the brightness
            const brightness = illuminationColor.r * 0.299 + illuminationColor.g * 0.587 + illuminationColor.b * 0.114;
            
            // Boost dark colors slightly to ensure they create visible illumination
            if (brightness < 0.3) {
                illuminationColor.multiplyScalar(1.5);
            }
        } else {
            // Default to a purple glow if no custom color is set
            illuminationColor = new THREE.Color(0x6b46fe);
        }
        
        // Create a group to hold all illumination effects
        this.illuminationEffect = new THREE.Group();
        
        // Add front-facing spotlight with reduced intensity
        const frontLight = new THREE.SpotLight(illuminationColor, 1.5, 300, Math.PI / 12, 0.6, 1);
        frontLight.position.set(0, 0, 100);
        frontLight.target = this.currentModel;
        frontLight.castShadow = false;
        this.illuminationEffect.add(frontLight);
        
        // Create a focused point light directly on the text face
        const pointLight = new THREE.PointLight(illuminationColor, 0.8, 100);
        pointLight.position.set(0, 0, 30);
        this.illuminationEffect.add(pointLight);
        
        // Add the illumination effects to the scene
        this.scene.add(this.illuminationEffect);
    }
    
    /**
     * Reset the camera view to show the model properly
     */
    resetCameraView() {
        if (!this.currentModel) return;
        
        // Create a bounding box for the model
        const bbox = new THREE.Box3().setFromObject(this.currentModel);
        
        // Calculate the size of the bounding box
        const size = new THREE.Vector3();
        bbox.getSize(size);
        
        // Calculate the center of the bounding box
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        
        // Calculate the distance based on the size
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2.0; // Increased to show more of the scene
        
        // Set the camera at a standard front position
        this.camera.position.set(0, 0, distance);
        this.camera.lookAt(0, 0, 0);
        
        // Update the controls target to the center of the scene
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    /**
     * Toggle wireframe mode on/off
     */
    toggleWireframe() {
        this.wireframeMode = !this.wireframeMode;
        this.applyWireframe(this.wireframeMode);
        
        // Highlight the wireframe button when active
        const wireframeButton = document.getElementById('toggle-wireframe');
        if (wireframeButton) {
            if (this.wireframeMode) {
                wireframeButton.classList.add('active');
            } else {
                wireframeButton.classList.remove('active');
            }
        }
    }
    
    /**
     * Apply or remove wireframe mode to all meshes
     * @param {boolean} enable - Whether to enable or disable wireframe
     */
    applyWireframe(enable) {
        if (!this.currentModel) return;
        
        this.currentModel.traverse(child => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.wireframe = enable;
                    });
                } else {
                    child.material.wireframe = enable;
                }
            }
        });
    }

    /**
     * Update model appearance based on color settings
     * @param {Object} colorSettings - Object with frontColor and sideColor properties
     */
    updateModelColors(colorSettings) {
        if (!this.currentModel) return;
        
        // Store the front color for future use
        if (colorSettings.frontColor) {
            this.frontColor = colorSettings.frontColor;
            const frontColorThree = new THREE.Color(colorSettings.frontColor);
            
            // Calculate perceived brightness of the color (0-1)
            const brightness = frontColorThree.r * 0.299 + frontColorThree.g * 0.587 + frontColorThree.b * 0.114;
            
            // For any color, use it directly as the emissive
            const emissiveColor = frontColorThree.clone();
            
            // Create a new material with the chosen color and moderate glow
            const newMaterial = new THREE.MeshPhysicalMaterial({
                color: frontColorThree,
                metalness: 0.1,
                roughness: 0.05, // Keep reduced roughness for crisper edges
                reflectivity: 0.8, 
                emissive: emissiveColor, // Use the selected color for emissive
                emissiveIntensity: 0.8, // Reduced intensity
                clearcoat: 1.0,
                clearcoatRoughness: 0 // Smooth clearcoat for crisp edges
            });
            
            // Update materials on all model meshes
            this.currentModel.traverse(child => {
                if (child.isMesh && Array.isArray(child.material)) {
                    // Update only the front face material (index 0)
                    if (child.material[0]) {
                        child.material[0] = newMaterial;
                    }
                }
            });
            
            // Update the illumination effect to match the new color
            if (this.illuminationEffect) {
                // Remove the existing illumination effect
                this.scene.remove(this.illuminationEffect);
                
                // Recreate the illumination effect with the new color
                this.addIlluminationEffect();
            }
            
            // Adjust bloom parameters based on color brightness
            if (this.bloomPass) {
                // Higher threshold for crisper bloom edge
                this.bloomPass.threshold = 0.4;
                
                // Lower strength for less blur and less brightness
                this.bloomPass.strength = 0.3;
                
                // Lower radius for sharper bloom
                this.bloomPass.radius = 0.2;
            }
        }
        
        // Update side color if provided
        if (colorSettings.sideColor) {
            const sideColorThree = new THREE.Color(colorSettings.sideColor);
            
            // Create a new glossy material for sides using MeshPhysicalMaterial
            const newSideMaterial = new THREE.MeshPhysicalMaterial({
                color: sideColorThree,
                metalness: 1.0, // Fully metallic for sharp edges
                roughness: 0.05, // Very smooth
                reflectivity: 1.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0 // Completely smooth clearcoat
            });
            
            // Update materials on all model meshes
            this.currentModel.traverse(child => {
                if (child.isMesh && Array.isArray(child.material)) {
                    // Update side materials (index 1+)
                    for (let i = 1; i < child.material.length; i++) {
                        if (child.material[i]) {
                            child.material[i] = newSideMaterial;
                        }
                    }
                }
            });
        }
    }

    /**
     * Get the current model
     * @returns {THREE.Group} - The current model
     */
    getCurrentModel() {
        return this.currentModel;
    }

    /**
     * Set up post-processing with bloom effect
     */
    setupPostProcessing() {
        // Get renderer size
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const renderScene = new RenderPass(this.scene, this.camera);
        
        // Add bloom with reduced intensity
        this.bloomStrength = 0.3; // Further reduced strength
        this.bloomRadius = 0.2; // Keep sharp radius
        this.bloomThreshold = 0.4; // Increased threshold to reduce bloom spread
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            this.bloomStrength,
            this.bloomRadius,
            this.bloomThreshold
        );
        
        // Configure the bloom effect
        bloomPass.threshold = this.bloomThreshold;
        bloomPass.strength = this.bloomStrength;
        bloomPass.radius = this.bloomRadius;
        
        // Output pass to maintain colors
        const outputPass = new OutputPass();
        
        // Set up composer with passes
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
        this.composer.addPass(outputPass);
        
        // Store the bloom pass for later adjustments
        this.bloomPass = bloomPass;
    }

    /**
     * Toggle fullscreen mode for the preview container
     */
    toggleFullscreen() {
        const previewPanel = document.querySelector('.preview-panel');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (previewPanel.requestFullscreen) {
                previewPanel.requestFullscreen();
            } else if (previewPanel.webkitRequestFullscreen) {
                previewPanel.webkitRequestFullscreen();
            } else if (previewPanel.msRequestFullscreen) {
                previewPanel.msRequestFullscreen();
            }
            
            // Update button icon
            const fullscreenButton = document.getElementById('fullscreen-button');
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Update button icon
            const fullscreenButton = document.getElementById('fullscreen-button');
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-line"></i>';
            }
        }
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.handleResize();
            this.updateFullscreenButton();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleResize();
            this.updateFullscreenButton();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.handleResize();
            this.updateFullscreenButton();
        });
    }
    
    /**
     * Update fullscreen button icon based on current state
     */
    updateFullscreenButton() {
        const fullscreenButton = document.getElementById('fullscreen-button');
        if (fullscreenButton) {
            if (document.fullscreenElement) {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
            } else {
                fullscreenButton.innerHTML = '<i class="ri-fullscreen-line"></i>';
            }
        }
    }

    /**
     * Create effects control panel
     */
    createEffectsPanel() {
        // Create a container for the effects panel
        const effectsPanel = document.createElement('div');
        effectsPanel.className = 'effects-panel';
        effectsPanel.innerHTML = `
            <div class="panel-header">
                <h3><i class="ri-magic-line"></i> Effects</h3>
                <button class="panel-toggle"><i class="ri-arrow-up-s-line"></i></button>
            </div>
            <div class="panel-content">
                <div class="effect-group">
                    <div class="effect-header">
                        <label for="bloom-enabled">Bloom Effect</label>
                        <input type="checkbox" id="bloom-enabled" ${this.effects.bloom.enabled ? 'checked' : ''}>
                    </div>
                    <div class="effect-controls">
                        <div class="slider-container">
                            <label for="bloom-strength">Strength</label>
                            <input type="range" id="bloom-strength" min="0" max="1" step="0.05" value="${this.effects.bloom.strength}">
                            <span id="bloom-strength-value">${this.effects.bloom.strength.toFixed(2)}</span>
                        </div>
                        <div class="slider-container">
                            <label for="bloom-radius">Radius</label>
                            <input type="range" id="bloom-radius" min="0" max="1" step="0.05" value="${this.effects.bloom.radius}">
                            <span id="bloom-radius-value">${this.effects.bloom.radius.toFixed(2)}</span>
                        </div>
                        <div class="slider-container">
                            <label for="bloom-threshold">Threshold</label>
                            <input type="range" id="bloom-threshold" min="0" max="1" step="0.05" value="${this.effects.bloom.threshold}">
                            <span id="bloom-threshold-value">${this.effects.bloom.threshold.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="effect-group">
                    <div class="effect-header">
                        <label for="rotation-enabled">Auto-Rotation</label>
                        <input type="checkbox" id="rotation-enabled" ${this.effects.rotation.enabled ? 'checked' : ''}>
                    </div>
                    <div class="effect-controls">
                        <div class="slider-container">
                            <label for="rotation-speed">Speed</label>
                            <input type="range" id="rotation-speed" min="0.001" max="0.05" step="0.001" value="${this.effects.rotation.speed}">
                            <span id="rotation-speed-value">${this.effects.rotation.speed.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="effect-group">
                    <div class="effect-header">
                        <label for="pulse-enabled">Pulsing Glow</label>
                        <input type="checkbox" id="pulse-enabled" ${this.effects.pulse.enabled ? 'checked' : ''}>
                    </div>
                    <div class="effect-controls">
                        <div class="slider-container">
                            <label for="pulse-speed">Speed</label>
                            <input type="range" id="pulse-speed" min="0.01" max="0.2" step="0.01" value="${this.effects.pulse.speed}">
                            <span id="pulse-speed-value">${this.effects.pulse.speed.toFixed(2)}</span>
                        </div>
                        <div class="slider-container">
                            <label for="pulse-min">Min Intensity</label>
                            <input type="range" id="pulse-min" min="0" max="1" step="0.05" value="${this.effects.pulse.min}">
                            <span id="pulse-min-value">${this.effects.pulse.min.toFixed(2)}</span>
                        </div>
                        <div class="slider-container">
                            <label for="pulse-max">Max Intensity</label>
                            <input type="range" id="pulse-max" min="0" max="2" step="0.05" value="${this.effects.pulse.max}">
                            <span id="pulse-max-value">${this.effects.pulse.max.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add effects panel to the app container
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.appendChild(effectsPanel);
            
            // Set up event listeners for controls
            this.setupEffectsControls();
            
            // Set up panel toggle behavior
            const panelToggle = effectsPanel.querySelector('.panel-toggle');
            if (panelToggle) {
                panelToggle.addEventListener('click', () => {
                    effectsPanel.classList.toggle('collapsed');
                });
            }
        }
    }
    
    /**
     * Set up event listeners for effects controls
     */
    setupEffectsControls() {
        // Bloom effect controls
        const bloomEnabled = document.getElementById('bloom-enabled');
        const bloomStrength = document.getElementById('bloom-strength');
        const bloomRadius = document.getElementById('bloom-radius');
        const bloomThreshold = document.getElementById('bloom-threshold');
        
        if (bloomEnabled) {
            bloomEnabled.addEventListener('change', () => {
                this.effects.bloom.enabled = bloomEnabled.checked;
                this.updateBloomEffect();
            });
        }
        
        if (bloomStrength) {
            bloomStrength.addEventListener('input', () => {
                const value = parseFloat(bloomStrength.value);
                this.effects.bloom.strength = value;
                document.getElementById('bloom-strength-value').textContent = value.toFixed(2);
                this.updateBloomEffect();
            });
        }
        
        if (bloomRadius) {
            bloomRadius.addEventListener('input', () => {
                const value = parseFloat(bloomRadius.value);
                this.effects.bloom.radius = value;
                document.getElementById('bloom-radius-value').textContent = value.toFixed(2);
                this.updateBloomEffect();
            });
        }
        
        if (bloomThreshold) {
            bloomThreshold.addEventListener('input', () => {
                const value = parseFloat(bloomThreshold.value);
                this.effects.bloom.threshold = value;
                document.getElementById('bloom-threshold-value').textContent = value.toFixed(2);
                this.updateBloomEffect();
            });
        }
        
        // Rotation effect controls
        const rotationEnabled = document.getElementById('rotation-enabled');
        const rotationSpeed = document.getElementById('rotation-speed');
        
        if (rotationEnabled) {
            rotationEnabled.addEventListener('change', () => {
                this.effects.rotation.enabled = rotationEnabled.checked;
                
                // Reset rotation when disabled
                if (!this.effects.rotation.enabled && this.currentModel) {
                    this.currentModel.rotation.y = 0;
                }
            });
        }
        
        if (rotationSpeed) {
            rotationSpeed.addEventListener('input', () => {
                const value = parseFloat(rotationSpeed.value);
                this.effects.rotation.speed = value;
                document.getElementById('rotation-speed-value').textContent = value.toFixed(3);
            });
        }
        
        // Pulse effect controls
        const pulseEnabled = document.getElementById('pulse-enabled');
        const pulseSpeed = document.getElementById('pulse-speed');
        const pulseMin = document.getElementById('pulse-min');
        const pulseMax = document.getElementById('pulse-max');
        
        if (pulseEnabled) {
            pulseEnabled.addEventListener('change', () => {
                this.effects.pulse.enabled = pulseEnabled.checked;
                
                // Reset emissive intensity when pulse is disabled
                if (!this.effects.pulse.enabled && this.currentModel) {
                    this.currentModel.traverse(child => {
                        if (child.isMesh && Array.isArray(child.material)) {
                            if (child.material[0] && child.material[0].emissiveIntensity !== undefined) {
                                child.material[0].emissiveIntensity = 0.8; // Reset to default
                            }
                        }
                    });
                }
            });
        }
        
        if (pulseSpeed) {
            pulseSpeed.addEventListener('input', () => {
                const value = parseFloat(pulseSpeed.value);
                this.effects.pulse.speed = value;
                document.getElementById('pulse-speed-value').textContent = value.toFixed(2);
            });
        }
        
        if (pulseMin) {
            pulseMin.addEventListener('input', () => {
                const value = parseFloat(pulseMin.value);
                this.effects.pulse.min = value;
                document.getElementById('pulse-min-value').textContent = value.toFixed(2);
            });
        }
        
        if (pulseMax) {
            pulseMax.addEventListener('input', () => {
                const value = parseFloat(pulseMax.value);
                this.effects.pulse.max = value;
                document.getElementById('pulse-max-value').textContent = value.toFixed(2);
            });
        }
    }
    
    /**
     * Update bloom effect based on current settings
     */
    updateBloomEffect() {
        if (this.bloomPass) {
            const bloom = this.effects.bloom;
            
            if (bloom.enabled) {
                this.bloomPass.strength = bloom.strength;
                this.bloomPass.radius = bloom.radius;
                this.bloomPass.threshold = bloom.threshold;
                
                // Make sure bloom pass is enabled in the composer
                if (this.composer) {
                    // Re-add bloom pass if it was removed
                    let hasBloomPass = false;
                    this.composer.passes.forEach(pass => {
                        if (pass === this.bloomPass) {
                            hasBloomPass = true;
                        }
                    });
                    
                    if (!hasBloomPass) {
                        // Re-add bloom pass after render pass
                        const renderPass = this.composer.passes[0];
                        this.composer.passes = [renderPass];
                        this.composer.addPass(this.bloomPass);
                        
                        // Re-add output pass if it exists
                        const outputPass = new OutputPass();
                        this.composer.addPass(outputPass);
                    }
                }
            } else {
                // Remove bloom pass from composer
                if (this.composer) {
                    const newPasses = this.composer.passes.filter(pass => pass !== this.bloomPass);
                    this.composer.passes = newPasses;
                }
            }
        }
    }
}

// Export the class as default
export default PreviewRenderer;