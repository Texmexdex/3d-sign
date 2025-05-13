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
        this.bloomStrength = 0.8; // Increased bloom strength back up
        this.bloomRadius = 0.3; // Increased bloom radius
        this.bloomThreshold = 0.1; // Lower threshold to work with all colors
        
        // Removed pulsing glow effect variables
        
        this.initRenderer();
        this.setupPostProcessing();
        this.animate();
        this.handleResize();
        this.initControlButtons();
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
}

// Export the class as default
export default PreviewRenderer;