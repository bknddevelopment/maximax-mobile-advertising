/**
 * MaxiMax Mobile Advertising - Advanced GSAP ScrollTrigger Animations
 * Production-ready scroll animations for Tier 3 website
 * Version: 4.0.0 - Enhanced Cinematic Edition
 */

// Wait for DOM and GSAP to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Check for GSAP availability
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded. Please include GSAP CDN in your HTML:');
        console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>');
        console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>');
        console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js"></script>');
        console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/MotionPathPlugin.min.js"></script>');
        return;
    }
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    if (window.TextPlugin) gsap.registerPlugin(TextPlugin);
    if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
    
    // Global settings
    gsap.config({
        nullTargetWarn: false,
        force3D: true
    });
    
    // Smooth scroll behavior
    ScrollTrigger.config({
        ignoreMobileResize: true,
        limitCallbacks: true,
        syncInterval: 40
    });
    
    /**
     * Initialize Split Text Animations
     */
    class TextSplitter {
        constructor(element) {
            this.element = element;
            this.originalText = element.textContent;
            this.splitText();
        }
        
        splitText() {
            const text = this.originalText;
            const words = text.split(' ');
            this.element.innerHTML = '';
            
            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'split-word';
                wordSpan.style.cssText = 'display: inline-block; margin-right: 0.3em;';
                
                [...word].forEach((letter, letterIndex) => {
                    const letterSpan = document.createElement('span');
                    letterSpan.className = 'split-letter';
                    letterSpan.textContent = letter;
                    letterSpan.style.cssText = 'display: inline-block; transform-origin: 50% 100%;';
                    wordSpan.appendChild(letterSpan);
                });
                
                this.element.appendChild(wordSpan);
            });
        }
        
        getLetters() {
            return this.element.querySelectorAll('.split-letter');
        }
        
        getWords() {
            return this.element.querySelectorAll('.split-word');
        }
    }
    
    /**
     * Hero Section Animations
     */
    function initHeroAnimations() {
        const heroSection = document.querySelector('#hero, .hero-section, .hero');
        if (!heroSection) return;
        
        // Hero Timeline
        const heroTl = gsap.timeline({
            defaults: { ease: 'power3.out' }
        });
        
        // Animate hero title with split text
        const heroTitle = heroSection.querySelector('h1, .hero-title');
        if (heroTitle) {
            const splitter = new TextSplitter(heroTitle);
            const letters = splitter.getLetters();
            
            gsap.set(letters, {
                opacity: 0,
                y: 50,
                rotateX: -90
            });
            
            heroTl.to(letters, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 1.2,
                stagger: {
                    each: 0.03,
                    from: 'start'
                }
            });
        }
        
        // Animate hero subtitle
        const heroSubtitle = heroSection.querySelector('.hero-subtitle, .subtitle, h2');
        if (heroSubtitle) {
            heroTl.from(heroSubtitle, {
                opacity: 0,
                y: 30,
                duration: 1
            }, '-=0.5');
        }
        
        // Animate CTA buttons
        const ctaButtons = heroSection.querySelectorAll('.hero-cta button, .cta-button, .btn-primary');
        if (ctaButtons.length) {
            heroTl.from(ctaButtons, {
                opacity: 0,
                scale: 0.8,
                y: 20,
                duration: 0.8,
                stagger: 0.2
            }, '-=0.3');
        }
    }
    
    /**
     * Truck Animation - Driving Across Screen
     */
    function initTruckAnimation() {
        let truckContainer = document.querySelector('.truck-animation-container, #truck-animation, .truck-visual');
        
        // Create container if it doesn't exist but there's a suitable section
        if (!truckContainer) {
            const targetSection = document.querySelector('#services, #about, .services-section');
            if (targetSection) {
                truckContainer = document.createElement('div');
                truckContainer.className = 'truck-animation-container';
                truckContainer.style.cssText = 'position: relative; width: 100%; height: 150px; overflow: hidden; margin: 50px 0;';
                targetSection.appendChild(truckContainer);
            }
        }
        
        if (!truckContainer) return;
        
        // Create truck SVG dynamically
        const truckSVG = `
            <svg class="truck-svg" width="250" height="120" viewBox="0 0 250 120" style="position: absolute; top: 20px;">
                <defs>
                    <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#EC008C;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#00AEEF;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <g class="truck-group">
                    <!-- Truck Trailer -->
                    <rect class="truck-body" x="10" y="30" width="140" height="50" fill="#2563eb" rx="5"/>
                    <!-- Billboard Display -->
                    <rect class="truck-billboard" x="20" y="35" width="120" height="40" fill="url(#truckGradient)" opacity="0.9" rx="3"/>
                    <text x="80" y="58" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">MAXIMAX</text>
                    <text x="80" y="70" text-anchor="middle" fill="white" font-size="8" font-family="Arial, sans-serif">Mobile Advertising</text>
                    <!-- Truck Cab -->
                    <rect class="truck-cab" x="150" y="25" width="70" height="55" fill="#1e40af" rx="5"/>
                    <!-- Windows -->
                    <rect x="155" y="30" width="60" height="25" fill="#87CEEB" opacity="0.7" rx="3"/>
                    <!-- Wheels -->
                    <circle class="wheel wheel-1" cx="50" cy="85" r="10" fill="#1f2937"/>
                    <circle class="wheel wheel-2" cx="120" cy="85" r="10" fill="#1f2937"/>
                    <circle class="wheel wheel-3" cx="180" cy="85" r="10" fill="#1f2937"/>
                    <!-- Wheel details -->
                    <circle cx="50" cy="85" r="5" fill="#6b7280"/>
                    <circle cx="120" cy="85" r="5" fill="#6b7280"/>
                    <circle cx="180" cy="85" r="5" fill="#6b7280"/>
                </g>
            </svg>
        `;
        
        truckContainer.innerHTML = truckSVG;
        const truck = truckContainer.querySelector('.truck-group');
        const wheels = truckContainer.querySelectorAll('.wheel');
        
        // Truck driving animation
        const truckTl = gsap.timeline({
            scrollTrigger: {
                trigger: truckContainer,
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: 1.5,
                markers: false
            }
        });
        
        // Main truck movement
        truckTl.fromTo(truck, {
            x: -300
        }, {
            x: window.innerWidth + 100,
            duration: 3,
            ease: 'none'
        });
        
        // Wheel rotation
        truckTl.to(wheels, {
            rotation: 720,
            duration: 3,
            ease: 'none',
            transformOrigin: 'center'
        }, 0);
        
        // Truck bounce effect for realistic movement
        truckTl.to(truck, {
            y: -3,
            duration: 0.1,
            repeat: 30,
            yoyo: true,
            ease: 'sine.inOut'
        }, 0);
    }
    
    /**
     * Billboard Content Animation
     */
    function initBillboardAnimation() {
        const billboards = document.querySelectorAll('.billboard-showcase, .billboard-item, .showcase-item');
        if (!billboards.length) return;
        
        billboards.forEach((billboard, index) => {
            let content = billboard.querySelector('.billboard-content, .content, p');
            
            // Create content element if it doesn't exist
            if (!content) {
                content = document.createElement('div');
                content.className = 'billboard-content';
                content.style.cssText = 'font-size: 1.5rem; font-weight: bold; text-align: center; padding: 20px;';
                billboard.appendChild(content);
            }
            
            const messages = [
                'Your Brand Here',
                'Maximum Impact',
                'Mobile Advertising',
                'Coast to Coast',
                'MaxiMax Delivers',
                '24/7 Visibility',
                'Target Your Audience'
            ];
            
            // Billboard reveal animation with message rotation
            const billboardTl = gsap.timeline({
                scrollTrigger: {
                    trigger: billboard,
                    start: 'top 70%',
                    end: 'bottom 30%',
                    scrub: 1,
                    onUpdate: (self) => {
                        const progress = Math.floor(self.progress * messages.length);
                        if (content && messages[progress]) {
                            content.textContent = messages[progress];
                        }
                    }
                }
            });
            
            billboardTl
                .fromTo(billboard, {
                    rotateY: -45,
                    opacity: 0,
                    scale: 0.8
                }, {
                    rotateY: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1
                })
                .to(billboard, {
                    rotateY: 45,
                    opacity: 0.5,
                    scale: 0.9,
                    duration: 1
                });
        });
    }
    
    /**
     * Route Path Drawing Animation
     */
    function initRoutePathAnimation() {
        let routePath = document.querySelector('.route-path-svg, #route-path, .route-animation');
        
        // Create route path if container exists
        if (!routePath) {
            const mapSection = document.querySelector('#coverage, .coverage-section, .map-section');
            if (mapSection) {
                routePath = document.createElement('div');
                routePath.className = 'route-path-svg';
                routePath.style.cssText = 'width: 100%; height: 400px; margin: 40px 0;';
                mapSection.appendChild(routePath);
            }
        }
        
        if (!routePath) return;
        
        // Create animated route path SVG
        const pathSVG = `
            <svg width="100%" height="400" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#EC008C;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#00AEEF;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#FFC700;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <!-- Route line -->
                <path id="route-line" class="route-line" 
                      d="M50,200 Q200,100 400,200 T750,200" 
                      stroke="url(#routeGradient)" 
                      stroke-width="4" 
                      fill="none" 
                      stroke-dasharray="1500" 
                      stroke-dashoffset="1500"
                      stroke-linecap="round"/>
                <!-- City markers -->
                <circle cx="50" cy="200" r="8" fill="#EC008C" opacity="0" class="city-marker"/>
                <circle cx="400" cy="200" r="8" fill="#00AEEF" opacity="0" class="city-marker"/>
                <circle cx="750" cy="200" r="8" fill="#FFC700" opacity="0" class="city-marker"/>
                <!-- Moving truck icon -->
                <g class="route-truck" opacity="0">
                    <rect x="-15" y="-10" width="30" height="20" fill="#2563eb" rx="3"/>
                    <rect x="-10" y="-7" width="20" height="10" fill="#fbbf24" rx="2"/>
                </g>
            </svg>
        `;
        
        routePath.innerHTML = pathSVG;
        const path = routePath.querySelector('.route-line');
        const cityMarkers = routePath.querySelectorAll('.city-marker');
        const routeTruck = routePath.querySelector('.route-truck');
        
        // Animate route drawing
        const routeTl = gsap.timeline({
            scrollTrigger: {
                trigger: routePath,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 1
            }
        });
        
        routeTl
            .to(path, {
                strokeDashoffset: 0,
                duration: 2,
                ease: 'none'
            })
            .to(cityMarkers, {
                opacity: 1,
                scale: 1.5,
                duration: 0.3,
                stagger: 0.2,
                ease: 'back.out(1.7)'
            }, '-=1')
            .to(routeTruck, {
                opacity: 1,
                duration: 0.3
            }, '-=1.5')
            .to(routeTruck, {
                motionPath: {
                    path: '#route-line',
                    align: '#route-line',
                    alignOrigin: [0.5, 0.5],
                    autoRotate: true
                },
                duration: 2,
                ease: 'none'
            }, '-=2');
    }
    
    /**
     * Statistics Counter Animation with Easing
     */
    function initStatisticsAnimation() {
        const stats = document.querySelectorAll('.stat-counter, .stat-number, [data-target]');
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target') || stat.textContent) || 0;
            const suffix = stat.getAttribute('data-suffix') || '';
            const prefix = stat.getAttribute('data-prefix') || '';
            const decimals = parseInt(stat.getAttribute('data-decimals')) || 0;
            
            const counter = { value: 0 };
            
            ScrollTrigger.create({
                trigger: stat,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    // Counter animation
                    gsap.to(counter, {
                        value: target,
                        duration: 2.5,
                        ease: 'power2.out',
                        onUpdate: () => {
                            if (decimals > 0) {
                                stat.textContent = prefix + counter.value.toFixed(decimals).toLocaleString() + suffix;
                            } else {
                                stat.textContent = prefix + Math.floor(counter.value).toLocaleString() + suffix;
                            }
                        }
                    });
                    
                    // Visual impact effect
                    gsap.fromTo(stat, {
                        scale: 0.5,
                        opacity: 0
                    }, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.5,
                        ease: 'back.out(1.7)'
                    });
                    
                    // Glow effect
                    gsap.to(stat, {
                        textShadow: '0 0 20px rgba(236, 0, 140, 0.5)',
                        duration: 0.5,
                        yoyo: true,
                        repeat: 1
                    });
                }
            });
        });
    }
    
    /**
     * Parallax Depth Effects
     */
    function initParallaxEffects() {
        // Background parallax layers
        gsap.utils.toArray('.parallax-bg, [data-parallax]').forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed') || layer.getAttribute('data-parallax')) || 0.5;
            
            gsap.to(layer, {
                yPercent: -50 * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: layer,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
        
        // Foreground elements parallax with horizontal option
        gsap.utils.toArray('.parallax-element').forEach(element => {
            const speed = parseFloat(element.getAttribute('data-speed')) || 0.8;
            const direction = element.getAttribute('data-direction') || 'vertical';
            
            if (direction === 'horizontal') {
                gsap.fromTo(element, {
                    xPercent: -30 * speed
                }, {
                    xPercent: 30 * speed,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            } else {
                gsap.fromTo(element, {
                    yPercent: 30 * speed
                }, {
                    yPercent: -30 * speed,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            }
        });
    }
    
    /**
     * Section Pin Animations
     */
    function initPinAnimations() {
        // Pin service sections with content transitions
        const pinSections = document.querySelectorAll('.pin-section, [data-pin="true"]');
        
        pinSections.forEach((section, index) => {
            const content = section.querySelector('.pin-content, .content');
            
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '+=100%',
                    pin: true,
                    pinSpacing: true,
                    scrub: 1,
                    anticipatePin: 1
                }
            });
            
            if (content) {
                timeline
                    .fromTo(content, {
                        opacity: 0,
                        y: 100,
                        scale: 0.9
                    }, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1
                    })
                    .to(content, {
                        opacity: 0,
                        y: -100,
                        scale: 0.9,
                        duration: 1
                    }, '+=0.5');
            }
        });
    }
    
    /**
     * Reveal Animations with Stagger
     */
    function initRevealAnimations() {
        // Card reveals with 3D effect
        gsap.utils.toArray('.reveal-card, .service-card, .feature-card').forEach((card, index) => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                }
            })
            .set(card, { transformPerspective: 1000 })
            .from(card, {
                opacity: 0,
                y: 60,
                rotateX: -15,
                scale: 0.9,
                duration: 1,
                delay: index * 0.1,
                ease: 'power3.out'
            })
            .from(card.querySelectorAll('h3, h4, p, .icon'), {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.4');
        });
        
        // Batch feature reveals
        const features = document.querySelectorAll('.feature-item, .benefit-item, .grid-item');
        
        if (features.length) {
            ScrollTrigger.batch(features, {
                start: 'top 85%',
                once: true,
                onEnter: batch => {
                    gsap.from(batch, {
                        opacity: 0,
                        y: 40,
                        rotateX: -15,
                        scale: 0.95,
                        duration: 1.2,
                        stagger: 0.15,
                        ease: 'power3.out',
                        overwrite: true
                    });
                }
            });
        }
    }
    
    /**
     * Morphing Shapes Animation
     */
    function initMorphingShapes() {
        const morphContainers = document.querySelectorAll('.morph-container, .shape-morph');
        
        morphContainers.forEach(container => {
            const shapes = container.querySelectorAll('.morph-shape, path, polygon');
            if (shapes.length < 2) return;
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: 'top 70%',
                    end: 'bottom 30%',
                    scrub: 2
                }
            });
            
            shapes.forEach((shape, index) => {
                if (index === 0) {
                    gsap.set(shape, { opacity: 1 });
                } else {
                    gsap.set(shape, { opacity: 0 });
                    tl.to(shapes[index - 1], {
                        opacity: 0,
                        scale: 0.8,
                        rotation: 180,
                        duration: 0.5
                    })
                    .to(shape, {
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        duration: 0.5
                    }, '-=0.25');
                }
            });
        });
    }
    
    /**
     * Progress Indicators
     */
    function initProgressIndicators() {
        // Create scroll progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #EC008C 0%, #00AEEF 50%, #FFC700 100%);
            z-index: 9999;
            box-shadow: 0 0 10px rgba(236, 0, 140, 0.5);
            transition: width 0.1s ease-out;
        `;
        document.body.appendChild(progressBar);
        
        // Animate progress bar based on scroll
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            onUpdate: self => {
                progressBar.style.width = (self.progress * 100) + '%';
            }
        });
        
        // Section progress indicators
        const sections = document.querySelectorAll('.section-with-progress, section[data-progress="true"]');
        
        sections.forEach(section => {
            let indicator = section.querySelector('.section-progress');
            
            // Create indicator if it doesn't exist
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'section-progress';
                indicator.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #EC008C, #00AEEF);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease-out;
                `;
                section.style.position = 'relative';
                section.appendChild(indicator);
            }
            
            ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
                onUpdate: self => {
                    const progress = gsap.utils.clamp(0, 1, self.progress);
                    indicator.style.transform = `scaleX(${progress})`;
                }
            });
        });
    }
    
    /**
     * Advanced Timeline Sequences
     */
    function initTimelineSequences() {
        // Service showcase with cinematic transitions
        const showcaseSection = document.querySelector('.service-showcase, #showcase, .showcase-section');
        if (!showcaseSection) return;
        
        const showcaseTl = gsap.timeline({
            scrollTrigger: {
                trigger: showcaseSection,
                start: 'top top',
                end: '+=300%',
                pin: true,
                scrub: 1,
                anticipatePin: 1
            }
        });
        
        const services = showcaseSection.querySelectorAll('.service-item, .showcase-item');
        
        services.forEach((service, index) => {
            showcaseTl
                .fromTo(service, {
                    xPercent: 100,
                    opacity: 0,
                    scale: 0.8
                }, {
                    xPercent: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power2.inOut'
                })
                .to(service, {
                    xPercent: -100,
                    opacity: 0,
                    scale: 0.8,
                    duration: 1,
                    ease: 'power2.inOut'
                }, '+=0.5');
        });
    }
    
    /**
     * Text Split Letter Animation
     */
    function initTextSplitAnimations() {
        const splitTexts = document.querySelectorAll('.split-text, [data-split-text="true"]');
        
        splitTexts.forEach(element => {
            const splitter = new TextSplitter(element);
            const letters = splitter.getLetters();
            
            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.from(letters, {
                        opacity: 0,
                        y: 50,
                        rotateX: -90,
                        stagger: {
                            each: 0.02,
                            from: 'start'
                        },
                        duration: 0.8,
                        ease: 'back.out(1.7)'
                    });
                }
            });
        });
    }
    
    /**
     * Floating Elements Animation
     */
    function initFloatingElements() {
        const floaters = document.querySelectorAll('.float-element, .floating, [data-float="true"]');
        
        floaters.forEach(element => {
            const randomX = gsap.utils.random(-20, 20);
            const randomY = gsap.utils.random(-20, 20);
            const randomDelay = gsap.utils.random(0, 2);
            const randomDuration = gsap.utils.random(3, 6);
            
            gsap.to(element, {
                x: randomX,
                y: randomY,
                rotation: gsap.utils.random(-5, 5),
                duration: randomDuration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: randomDelay
            });
        });
    }
    
    /**
     * LED Billboard Effect
     */
    function initLEDEffect() {
        const ledContainers = document.querySelectorAll('.led-billboard, .led-display');
        
        ledContainers.forEach(container => {
            // Create LED grid
            const rows = 10;
            const cols = 20;
            
            for (let i = 0; i < rows * cols; i++) {
                const led = document.createElement('div');
                led.className = 'led-pixel';
                led.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${Math.random() > 0.5 ? '#EC008C' : '#00AEEF'};
                    border-radius: 50%;
                    left: ${(i % cols) * 5}%;
                    top: ${Math.floor(i / cols) * 10}%;
                    opacity: 0;
                `;
                container.style.position = 'relative';
                container.appendChild(led);
            }
            
            // Animate LEDs
            gsap.to(container.querySelectorAll('.led-pixel'), {
                opacity: 1,
                scale: gsap.utils.random(0.8, 1.2),
                stagger: {
                    each: 0.01,
                    from: 'random',
                    repeat: -1,
                    yoyo: true
                },
                duration: gsap.utils.random(0.5, 1),
                ease: 'power2.inOut'
            });
        });
    }
    
    /**
     * Initialize All Animations
     */
    function initAllAnimations() {
        // Core animations
        initHeroAnimations();
        initParallaxEffects();
        initRevealAnimations();
        initPinAnimations();
        initProgressIndicators();
        
        // Industry-specific animations
        initTruckAnimation();
        initBillboardAnimation();
        initRoutePathAnimation();
        initStatisticsAnimation();
        
        // Advanced effects
        initMorphingShapes();
        initTimelineSequences();
        initTextSplitAnimations();
        initFloatingElements();
        initLEDEffect();
        
        // Refresh ScrollTrigger after all animations are set
        ScrollTrigger.refresh();
        
        console.log('MaxiMax ScrollAnimations: All animations initialized');
        console.log('Total ScrollTriggers created:', ScrollTrigger.getAll().length);
    }
    
    /**
     * Performance Optimization
     */
    function optimizePerformance() {
        // Throttle scroll events
        let scrollTimer;
        window.addEventListener('scroll', () => {
            if (scrollTimer) return;
            scrollTimer = setTimeout(() => {
                scrollTimer = null;
            }, 100);
        });
        
        // Pause animations when not in viewport
        ScrollTrigger.config({
            limitCallbacks: true,
            syncInterval: 40
        });
        
        // Kill animations on page unload
        window.addEventListener('beforeunload', () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        });
        
        // Reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            ScrollTrigger.getAll().forEach(st => st.disable());
            console.log('Animations disabled: User prefers reduced motion');
        }
    }
    
    /**
     * Responsive Handling
     */
    function handleResponsive() {
        // Update ScrollTrigger on resize with debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                ScrollTrigger.refresh();
                console.log('ScrollTrigger refreshed after resize');
            }, 250);
        });
        
        // Mobile-specific adjustments
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            ScrollTrigger.config({
                autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize'
            });
            
            // Reduce animation complexity on mobile
            gsap.globalTimeline.timeScale(1.5); // Speed up animations
        }
    }
    
    /**
     * Debug Mode
     */
    function initDebugMode() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true' || urlParams.get('animations') === 'debug') {
            ScrollTrigger.defaults({
                markers: {
                    startColor: '#EC008C',
                    endColor: '#00AEEF',
                    fontSize: '12px'
                }
            });
            console.log('GSAP Debug Mode Enabled');
            console.log('Total ScrollTriggers:', ScrollTrigger.getAll().length);
            
            // Debug info overlay
            const debugInfo = document.createElement('div');
            debugInfo.style.cssText = `
                position: fixed;
                top: 60px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                border-radius: 5px;
            `;
            debugInfo.innerHTML = `
                <div>GSAP Debug Mode</div>
                <div>ScrollTriggers: ${ScrollTrigger.getAll().length}</div>
                <div>Screen: ${window.innerWidth}x${window.innerHeight}</div>
            `;
            document.body.appendChild(debugInfo);
        }
    }
    
    /**
     * Error Handling
     */
    function handleErrors() {
        window.addEventListener('error', (e) => {
            if (e.filename && e.filename.includes('ScrollAnimations.js')) {
                console.error('ScrollAnimation Error:', e.message);
                console.error('Line:', e.lineno, 'Column:', e.colno);
                
                // Gracefully degrade on error
                try {
                    ScrollTrigger.getAll().forEach(st => st.disable());
                    console.warn('Animations disabled due to error');
                } catch (err) {
                    console.error('Failed to disable animations:', err);
                }
            }
        });
    }
    
    /**
     * Initialize Everything
     */
    try {
        // Check dependencies
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            throw new Error('GSAP or ScrollTrigger not loaded');
        }
        
        // Initialize all animations
        initAllAnimations();
        
        // Setup optimizations and handlers
        optimizePerformance();
        handleResponsive();
        
        // Development helpers
        initDebugMode();
        handleErrors();
        
        // Success message
        console.log('%c✨ MaxiMax ScrollAnimations v4.0.0 initialized successfully!', 
                    'color: #00AEEF; font-weight: bold; font-size: 14px;');
        
    } catch (error) {
        console.error('Failed to initialize ScrollAnimations:', error);
        console.error('Make sure to include GSAP and ScrollTrigger scripts in your HTML');
    }
    
});

/**
 * Public API for external control
 */
window.MaxiMaxAnimations = {
    // Reinitialize all animations
    reinit: () => {
        ScrollTrigger.refresh();
        console.log('Animations refreshed');
    },
    
    // Pause all animations
    pause: () => {
        ScrollTrigger.getAll().forEach(st => st.disable());
        gsap.globalTimeline.pause();
        console.log('Animations paused');
    },
    
    // Resume all animations
    resume: () => {
        ScrollTrigger.getAll().forEach(st => st.enable());
        gsap.globalTimeline.resume();
        console.log('Animations resumed');
    },
    
    // Destroy all animations
    destroy: () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
        gsap.globalTimeline.clear();
        console.log('Animations destroyed');
    },
    
    // Get animation stats
    getStats: () => {
        return {
            totalTriggers: ScrollTrigger.getAll().length,
            activeTriggers: ScrollTrigger.getAll().filter(st => st.isActive).length,
            progress: ScrollTrigger.getAll().map(st => ({
                trigger: st.vars.trigger,
                progress: st.progress
            }))
        };
    },
    
    // Speed control
    setSpeed: (speed = 1) => {
        gsap.globalTimeline.timeScale(speed);
        console.log(`Animation speed set to ${speed}x`);
    },
    
    // Enable debug mode
    debug: () => {
        ScrollTrigger.getAll().forEach(st => {
            st.vars.markers = true;
            st.refresh();
        });
        console.log('Debug markers enabled');
    }
};