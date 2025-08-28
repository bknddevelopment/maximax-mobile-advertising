/**
 * MaxiMax Performance Optimization & Monitoring System
 * Comprehensive performance tracking and optimization for superior web experience
 * @version 4.0.0
 * @description Production-ready performance system with Core Web Vitals, RUM, and adaptive loading
 */

(function() {
    'use strict';

    // Performance Manager Module
    const PerformanceManager = {
        // Configuration
        config: {
            enableRUM: true,
            enableAdaptiveLoading: true,
            enableLazyLoading: true,
            performanceBudget: {
                lcp: 2500, // 2.5s
                fid: 100,  // 100ms
                cls: 0.1,  // 0.1
                fcp: 1800, // 1.8s
                ttfb: 600, // 600ms
                inp: 200   // 200ms
            },
            reportEndpoint: '/api/performance', // Analytics endpoint
            sampleRate: 0.1, // Sample 10% of users for RUM
            enableErrorTracking: true,
            enableResourceHints: true,
            enableFontOptimization: true,
            enableImageOptimization: true,
            enableScriptOptimization: true,
            enableCSSOptimization: true,
            enableMemoryManagement: true,
            enableNetworkAdaptation: true
        },

        // Performance data storage
        metrics: {
            vitals: {},
            resources: [],
            errors: [],
            userAgent: navigator.userAgent,
            connection: null,
            memory: null,
            deviceCapability: null,
            timestamp: Date.now(),
            sessionId: generateSessionId(),
            pageViews: 0,
            interactions: 0,
            budgetViolations: []
        },

        // State management
        observers: new Map(),
        lazyLoadTargets: new Set(),
        prefetchedUrls: new Set(),
        criticalResources: new Set(),
        resourceTimings: new Map(),
        
        // Initialize the performance system
        init() {
            // Check if APIs are supported
            if (!this.checkSupport()) {
                console.warn('Performance APIs not fully supported');
                this.fallbackInit();
                return;
            }

            // Start monitoring
            this.initCoreWebVitals();
            this.initResourceMonitoring();
            this.initErrorTracking();
            this.initNetworkDetection();
            this.initMemoryManagement();
            
            // Apply optimizations
            if (this.config.enableLazyLoading) {
                this.initLazyLoading();
            }
            
            if (this.config.enableAdaptiveLoading) {
                this.initAdaptiveLoading();
            }
            
            this.optimizeResourceLoading();
            this.optimizeFonts();
            this.optimizeImages();
            this.optimizeScripts();
            this.optimizeCSS();
            this.optimizeAnimations();
            
            // Start Real User Monitoring
            if (this.config.enableRUM && Math.random() < this.config.sampleRate) {
                this.initRUM();
            }

            // Setup page lifecycle monitoring
            this.initPageLifecycle();
            
            // Log initialization
            console.log('Performance Manager initialized successfully');
        },

        // Check browser support
        checkSupport() {
            return 'PerformanceObserver' in window && 
                   'IntersectionObserver' in window &&
                   'requestIdleCallback' in window;
        },

        // Fallback initialization for older browsers
        fallbackInit() {
            // Basic performance tracking for older browsers
            if (window.performance && window.performance.timing) {
                this.trackBasicMetrics();
            }
            
            // Basic lazy loading
            this.fallbackLazyLoading();
            
            console.log('Performance Manager initialized with fallback mode');
        },

        /**
         * Core Web Vitals Monitoring
         */
        initCoreWebVitals() {
            // Largest Contentful Paint (LCP)
            this.observeLCP();
            
            // First Input Delay (FID) & Input Timing
            this.observeFID();
            
            // Cumulative Layout Shift (CLS)
            this.observeCLS();
            
            // First Contentful Paint (FCP)
            this.observeFCP();
            
            // Time to First Byte (TTFB)
            this.measureTTFB();
            
            // Interaction to Next Paint (INP)
            this.observeINP();
            
            // Total Blocking Time (TBT)
            this.measureTBT();
        },

        observeLCP() {
            if (!('PerformanceObserver' in window)) return;
            
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    const value = Math.round(lastEntry.renderTime || lastEntry.loadTime);
                    
                    this.metrics.vitals.lcp = value;
                    this.checkPerformanceBudget('lcp', value);
                    this.reportMetric('LCP', value);
                });
                
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                this.observers.set('lcp', lcpObserver);
            } catch (e) {
                console.error('LCP Observer error:', e);
            }
        },

        observeFID() {
            if (!('PerformanceObserver' in window)) return;
            
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        const value = Math.round(entry.processingStart - entry.startTime);
                        
                        this.metrics.vitals.fid = value;
                        this.checkPerformanceBudget('fid', value);
                        this.reportMetric('FID', value);
                    });
                });
                
                fidObserver.observe({ type: 'first-input', buffered: true });
                this.observers.set('fid', fidObserver);
            } catch (e) {
                console.error('FID Observer error:', e);
            }
        },

        observeCLS() {
            if (!('PerformanceObserver' in window)) return;
            
            let clsValue = 0;
            let clsEntries = [];
            let sessionValue = 0;
            let sessionEntries = [];
            
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Only count layout shifts without recent user input
                        if (!entry.hadRecentInput) {
                            const firstSessionEntry = sessionEntries[0];
                            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                            
                            // New session logic
                            if (sessionValue && 
                                entry.startTime - lastSessionEntry.startTime >= 1000 ||
                                entry.startTime - firstSessionEntry.startTime >= 5000) {
                                sessionValue = entry.value;
                                sessionEntries = [entry];
                            } else {
                                sessionValue += entry.value;
                                sessionEntries.push(entry);
                            }
                            
                            // Keep maximum session value
                            if (sessionValue > clsValue) {
                                clsValue = sessionValue;
                                clsEntries = [...sessionEntries];
                            }
                            
                            const value = Math.round(clsValue * 1000) / 1000;
                            this.metrics.vitals.cls = value;
                            this.checkPerformanceBudget('cls', value);
                            this.reportMetric('CLS', value);
                        }
                    }
                });
                
                clsObserver.observe({ type: 'layout-shift', buffered: true });
                this.observers.set('cls', clsObserver);
            } catch (e) {
                console.error('CLS Observer error:', e);
            }
        },

        observeFCP() {
            if (!('PerformanceObserver' in window)) return;
            
            try {
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.name === 'first-contentful-paint') {
                            const value = Math.round(entry.startTime);
                            
                            this.metrics.vitals.fcp = value;
                            this.checkPerformanceBudget('fcp', value);
                            this.reportMetric('FCP', value);
                        }
                    });
                });
                
                fcpObserver.observe({ type: 'paint', buffered: true });
                this.observers.set('fcp', fcpObserver);
            } catch (e) {
                console.error('FCP Observer error:', e);
            }
        },

        measureTTFB() {
            // Use Navigation Timing API
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const ttfb = timing.responseStart - timing.navigationStart;
                const value = Math.round(ttfb);
                
                this.metrics.vitals.ttfb = value;
                this.checkPerformanceBudget('ttfb', value);
                this.reportMetric('TTFB', value);
            }
            
            // Also try Navigation Timing API v2
            if ('PerformanceObserver' in window) {
                try {
                    const navObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach(entry => {
                            if (entry.entryType === 'navigation') {
                                const value = Math.round(entry.responseStart - entry.fetchStart);
                                this.metrics.vitals.ttfb = value;
                                this.checkPerformanceBudget('ttfb', value);
                                this.reportMetric('TTFB', value);
                            }
                        });
                    });
                    
                    navObserver.observe({ type: 'navigation', buffered: true });
                    this.observers.set('navigation', navObserver);
                } catch (e) {
                    console.error('Navigation Observer error:', e);
                }
            }
        },

        observeINP() {
            if (!('PerformanceObserver' in window)) return;
            
            const interactionMap = new Map();
            
            try {
                const inpObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.interactionId) {
                            // Track unique interactions
                            if (!interactionMap.has(entry.interactionId)) {
                                interactionMap.set(entry.interactionId, []);
                            }
                            interactionMap.get(entry.interactionId).push(entry);
                        }
                        
                        // Calculate INP from the slowest interaction
                        let maxDuration = 0;
                        interactionMap.forEach((entries) => {
                            const duration = entries.reduce((sum, e) => sum + e.duration, 0);
                            if (duration > maxDuration) {
                                maxDuration = duration;
                            }
                        });
                        
                        if (maxDuration > 0) {
                            const value = Math.round(maxDuration);
                            this.metrics.vitals.inp = value;
                            this.checkPerformanceBudget('inp', value);
                            this.reportMetric('INP', value);
                        }
                    }
                });
                
                inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 });
                this.observers.set('inp', inpObserver);
            } catch (e) {
                console.error('INP Observer error:', e);
            }
        },

        measureTBT() {
            // Total Blocking Time measurement
            let tbt = 0;
            const longTaskThreshold = 50;
            
            if ('PerformanceObserver' in window) {
                try {
                    const tbtObserver = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.duration > longTaskThreshold) {
                                tbt += entry.duration - longTaskThreshold;
                                this.metrics.vitals.tbt = Math.round(tbt);
                            }
                        }
                    });
                    
                    tbtObserver.observe({ type: 'longtask', buffered: true });
                    this.observers.set('tbt', tbtObserver);
                } catch (e) {
                    console.error('TBT Observer error:', e);
                }
            }
        },

        /**
         * Resource Monitoring
         */
        initResourceMonitoring() {
            if (!('PerformanceObserver' in window)) return;
            
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        const resource = {
                            name: entry.name,
                            type: entry.initiatorType,
                            duration: Math.round(entry.duration),
                            size: entry.transferSize || 0,
                            protocol: entry.nextHopProtocol,
                            cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
                            timing: {
                                dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
                                tcp: Math.round(entry.connectEnd - entry.connectStart),
                                ttfb: Math.round(entry.responseStart - entry.requestStart),
                                download: Math.round(entry.responseEnd - entry.responseStart)
                            }
                        };
                        
                        this.metrics.resources.push(resource);
                        this.resourceTimings.set(entry.name, resource);
                        
                        // Warn about slow resources
                        if (resource.duration > 1000) {
                            console.warn(`Slow resource detected: ${resource.name} (${resource.duration}ms)`);
                        }
                        
                        // Track large resources
                        if (resource.size > 500000) { // 500KB
                            console.warn(`Large resource detected: ${resource.name} (${(resource.size / 1024 / 1024).toFixed(2)}MB)`);
                        }
                    });
                });
                
                resourceObserver.observe({ type: 'resource', buffered: true });
                this.observers.set('resource', resourceObserver);
            } catch (e) {
                console.error('Resource Observer error:', e);
            }
        },

        /**
         * Error Tracking
         */
        initErrorTracking() {
            if (!this.config.enableErrorTracking) return;
            
            // JavaScript errors
            window.addEventListener('error', (event) => {
                const error = {
                    type: 'javascript',
                    message: event.message,
                    filename: event.filename,
                    line: event.lineno,
                    column: event.colno,
                    stack: event.error ? event.error.stack : null,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };
                
                this.metrics.errors.push(error);
                this.reportError(error);
            });

            // Promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                const error = {
                    type: 'promise',
                    reason: event.reason,
                    promise: event.promise,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };
                
                this.metrics.errors.push(error);
                this.reportError(error);
            });

            // Resource loading errors
            window.addEventListener('error', (event) => {
                if (event.target !== window) {
                    const error = {
                        type: 'resource',
                        tagName: event.target.tagName,
                        src: event.target.src || event.target.href,
                        message: `Failed to load ${event.target.tagName}`,
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent,
                        url: window.location.href
                    };
                    
                    this.metrics.errors.push(error);
                    this.reportError(error);
                }
            }, true);
        },

        reportError(error) {
            // Log to console in development
            if (window.location.hostname === 'localhost') {
                console.error('Performance Manager Error:', error);
            }
            
            // Send to error tracking service
            if (this.config.reportEndpoint) {
                this.sendErrorReport(error);
            }
        },

        /**
         * Network Detection
         */
        initNetworkDetection() {
            const connection = navigator.connection || 
                             navigator.mozConnection || 
                             navigator.webkitConnection;
            
            if (connection) {
                this.updateConnectionInfo(connection);
                
                // Listen for connection changes
                connection.addEventListener('change', () => {
                    this.updateConnectionInfo(connection);
                    this.handleConnectionChange();
                });
            }
            
            // Monitor online/offline status
            window.addEventListener('online', () => {
                this.metrics.connection.online = true;
                console.log('Connection restored');
            });
            
            window.addEventListener('offline', () => {
                this.metrics.connection.online = false;
                console.warn('Connection lost');
            });
        },

        updateConnectionInfo(connection) {
            this.metrics.connection = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                downlinkMax: connection.downlinkMax,
                rtt: connection.rtt,
                saveData: connection.saveData || false,
                type: connection.type,
                online: navigator.onLine
            };
        },

        /**
         * Memory Management
         */
        initMemoryManagement() {
            if (!this.config.enableMemoryManagement) return;
            
            // Check memory API support
            if (!performance.memory) {
                console.log('Memory API not supported');
                return;
            }
            
            // Initial memory check
            this.checkMemory();
            
            // Periodic memory monitoring
            this.memoryInterval = setInterval(() => {
                this.checkMemory();
            }, 10000); // Check every 10 seconds
            
            // Clean up on page unload
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        },

        checkMemory() {
            const memory = performance.memory;
            const used = memory.usedJSHeapSize;
            const total = memory.totalJSHeapSize;
            const limit = memory.jsHeapSizeLimit;
            
            this.metrics.memory = {
                used: Math.round(used / 1048576), // Convert to MB
                total: Math.round(total / 1048576),
                limit: Math.round(limit / 1048576),
                percentage: (used / limit) * 100
            };
            
            // Warn if memory usage is high
            if (this.metrics.memory.percentage > 80) {
                console.warn(`High memory usage: ${this.metrics.memory.used}MB / ${this.metrics.memory.limit}MB (${this.metrics.memory.percentage.toFixed(1)}%)`);
                this.optimizeMemory();
            }
            
            // Critical memory threshold
            if (this.metrics.memory.percentage > 95) {
                console.error('Critical memory usage detected!');
                this.emergencyMemoryCleanup();
            }
        },

        optimizeMemory() {
            // Clear non-essential caches
            this.resourceTimings.clear();
            
            // Disconnect non-critical observers
            ['resource', 'paint'].forEach(key => {
                const observer = this.observers.get(key);
                if (observer) {
                    observer.disconnect();
                    this.observers.delete(key);
                }
            });
            
            // Clear old metrics
            if (this.metrics.resources.length > 100) {
                this.metrics.resources = this.metrics.resources.slice(-50);
            }
            
            if (this.metrics.errors.length > 50) {
                this.metrics.errors = this.metrics.errors.slice(-25);
            }
            
            // Trigger garbage collection if available
            if (window.gc) {
                window.gc();
            }
        },

        emergencyMemoryCleanup() {
            // Aggressive memory cleanup
            this.observers.forEach(observer => observer.disconnect());
            this.observers.clear();
            
            this.resourceTimings.clear();
            this.lazyLoadTargets.clear();
            this.prefetchedUrls.clear();
            
            this.metrics.resources = [];
            this.metrics.errors = [];
            
            // Stop animations
            document.querySelectorAll('[data-animation]').forEach(el => {
                el.style.animation = 'none';
            });
            
            // Remove event listeners from lazy load targets
            this.cleanupLazyLoading();
            
            console.log('Emergency memory cleanup completed');
        },

        /**
         * Lazy Loading Implementation
         */
        initLazyLoading() {
            // Configuration for lazy loading
            const config = {
                rootMargin: '50px 0px',
                threshold: 0.01
            };

            // Setup different types of lazy loading
            this.setupImageLazyLoading(config);
            this.setupIframeLazyLoading(config);
            this.setupVideoLazyLoading(config);
            this.setupBackgroundImageLazyLoading(config);
            this.setupComponentLazyLoading(config);
        },

        setupImageLazyLoading(config) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                        this.lazyLoadTargets.delete(img);
                    }
                });
            }, config);

            // Native lazy loading support
            if ('loading' in HTMLImageElement.prototype) {
                document.querySelectorAll('img[data-src]').forEach(img => {
                    img.loading = 'lazy';
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        delete img.dataset.src;
                    }
                });
            } else {
                // Fallback to Intersection Observer
                document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
                    imageObserver.observe(img);
                    this.lazyLoadTargets.add(img);
                });
            }
        },

        loadImage(img) {
            // Preload image for smooth transition
            const tempImg = new Image();
            
            tempImg.onload = () => {
                // Load regular source
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                }
                
                // Load srcset for responsive images
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    delete img.dataset.srcset;
                }
                
                // Load sizes attribute
                if (img.dataset.sizes) {
                    img.sizes = img.dataset.sizes;
                    delete img.dataset.sizes;
                }
                
                // Add loaded class for CSS transitions
                img.classList.add('loaded');
                
                // Trigger custom event
                img.dispatchEvent(new CustomEvent('lazyloaded'));
            };
            
            tempImg.onerror = () => {
                // Load fallback image if available
                if (img.dataset.fallback) {
                    img.src = img.dataset.fallback;
                }
                img.classList.add('error');
            };
            
            // Start loading
            tempImg.src = img.dataset.src || img.src;
        },

        setupIframeLazyLoading(config) {
            const iframeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const iframe = entry.target;
                        
                        if (iframe.dataset.src) {
                            iframe.src = iframe.dataset.src;
                            delete iframe.dataset.src;
                            iframe.classList.add('loaded');
                        }
                        
                        iframeObserver.unobserve(iframe);
                        this.lazyLoadTargets.delete(iframe);
                    }
                });
            }, config);

            document.querySelectorAll('iframe[data-src]').forEach(iframe => {
                if ('loading' in HTMLIFrameElement.prototype) {
                    iframe.loading = 'lazy';
                    iframe.src = iframe.dataset.src;
                    delete iframe.dataset.src;
                } else {
                    iframeObserver.observe(iframe);
                    this.lazyLoadTargets.add(iframe);
                }
            });
        },

        setupVideoLazyLoading(config) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        
                        if (video.dataset.src) {
                            video.src = video.dataset.src;
                            delete video.dataset.src;
                        }
                        
                        // Load video sources
                        video.querySelectorAll('source[data-src]').forEach(source => {
                            source.src = source.dataset.src;
                            delete source.dataset.src;
                        });
                        
                        video.load();
                        video.classList.add('loaded');
                        
                        videoObserver.unobserve(video);
                        this.lazyLoadTargets.delete(video);
                    }
                });
            }, config);

            document.querySelectorAll('video[data-src]').forEach(video => {
                videoObserver.observe(video);
                this.lazyLoadTargets.add(video);
            });
        },

        setupBackgroundImageLazyLoading(config) {
            const bgObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const bgImage = element.dataset.bg;
                        
                        // Preload background image
                        const img = new Image();
                        img.onload = () => {
                            element.style.backgroundImage = `url(${bgImage})`;
                            element.classList.add('bg-loaded');
                            delete element.dataset.bg;
                        };
                        img.src = bgImage;
                        
                        bgObserver.unobserve(element);
                        this.lazyLoadTargets.delete(element);
                    }
                });
            }, config);

            document.querySelectorAll('[data-bg]').forEach(element => {
                bgObserver.observe(element);
                this.lazyLoadTargets.add(element);
            });
        },

        setupComponentLazyLoading(config) {
            // Lazy load JavaScript components
            const componentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const component = element.dataset.component;
                        
                        if (component) {
                            this.loadComponent(component, element);
                            componentObserver.unobserve(element);
                            this.lazyLoadTargets.delete(element);
                        }
                    }
                });
            }, config);

            document.querySelectorAll('[data-component]').forEach(element => {
                componentObserver.observe(element);
                this.lazyLoadTargets.add(element);
            });
        },

        loadComponent(componentPath, element) {
            const script = document.createElement('script');
            script.src = componentPath;
            script.async = true;
            script.onload = () => {
                element.classList.add('component-loaded');
                element.dispatchEvent(new CustomEvent('componentloaded', {
                    detail: { component: componentPath }
                }));
            };
            document.body.appendChild(script);
        },

        cleanupLazyLoading() {
            this.lazyLoadTargets.forEach(target => {
                // Remove from any observers
                this.observers.forEach(observer => {
                    try {
                        observer.unobserve(target);
                    } catch (e) {
                        // Target might not be observed by this observer
                    }
                });
            });
            this.lazyLoadTargets.clear();
        },

        /**
         * Adaptive Loading
         */
        initAdaptiveLoading() {
            // Detect device capabilities
            this.detectDeviceCapabilities();
            
            // Apply adaptive strategies based on capabilities
            this.applyAdaptiveStrategies();
            
            // Monitor for changes
            this.monitorAdaptiveConditions();
        },

        detectDeviceCapabilities() {
            const memory = navigator.deviceMemory || 4;
            const cores = navigator.hardwareConcurrency || 4;
            const connection = this.metrics.connection;
            
            // Determine device tier
            let deviceTier = 'high';
            
            if (memory <= 2 || cores <= 2) {
                deviceTier = 'low';
            } else if (memory <= 4 || cores <= 4) {
                deviceTier = 'medium';
            }
            
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            // Check for data saver mode
            const saveData = connection && connection.saveData;
            
            // Determine network quality
            let networkQuality = 'good';
            
            if (connection) {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    networkQuality = 'poor';
                } else if (connection.effectiveType === '3g') {
                    networkQuality = 'moderate';
                } else if (connection.rtt > 300 || connection.downlink < 1) {
                    networkQuality = 'moderate';
                }
            }
            
            this.metrics.deviceCapability = {
                tier: deviceTier,
                memory: memory,
                cores: cores,
                networkQuality: networkQuality,
                prefersReducedMotion: prefersReducedMotion,
                saveData: saveData,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                devicePixelRatio: window.devicePixelRatio || 1
            };
        },

        applyAdaptiveStrategies() {
            const capability = this.metrics.deviceCapability;
            const body = document.body;
            
            // Remove existing classes
            body.classList.remove('device-low', 'device-medium', 'device-high',
                                 'network-poor', 'network-moderate', 'network-good');
            
            // Add appropriate classes
            body.classList.add(`device-${capability.tier}`);
            body.classList.add(`network-${capability.networkQuality}`);
            
            // Apply specific optimizations
            if (capability.tier === 'low' || capability.networkQuality === 'poor' || capability.saveData) {
                this.applyLowEndOptimizations();
            } else if (capability.tier === 'medium' || capability.networkQuality === 'moderate') {
                this.applyMediumOptimizations();
            } else {
                this.applyHighEndOptimizations();
            }
            
            // Handle reduced motion
            if (capability.prefersReducedMotion) {
                this.reduceMotion();
            }
        },

        applyLowEndOptimizations() {
            console.log('Applying low-end device optimizations');
            
            // Reduce animation complexity
            this.reduceAnimations();
            
            // Load lower quality images
            this.loadLowerQualityImages();
            
            // Disable non-essential features
            this.disableNonEssentialFeatures();
            
            // Reduce JavaScript execution
            this.throttleJavaScriptExecution();
            
            // Simplify layouts
            document.body.classList.add('simplified-layout');
        },

        applyMediumOptimizations() {
            console.log('Applying medium device optimizations');
            
            // Moderate animations
            this.moderateAnimations();
            
            // Load medium quality images
            this.loadMediumQualityImages();
            
            // Selective feature loading
            this.loadSelectiveFeatures();
        },

        applyHighEndOptimizations() {
            console.log('Applying high-end device optimizations');
            
            // Enable all features
            this.enableAllFeatures();
            
            // Prefetch next-page resources
            this.aggressivePrefetching();
            
            // Enable advanced animations
            this.enableAdvancedAnimations();
        },

        reduceAnimations() {
            const style = document.createElement('style');
            style.textContent = `
                .device-low *,
                .network-poor * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
            
            // Disable parallax effects
            document.querySelectorAll('[data-parallax]').forEach(el => {
                el.removeAttribute('data-parallax');
            });
            
            // Stop video backgrounds
            document.querySelectorAll('video[autoplay]').forEach(video => {
                video.pause();
                video.removeAttribute('autoplay');
            });
        },

        reduceMotion() {
            document.body.classList.add('prefers-reduced-motion');
            
            const style = document.createElement('style');
            style.textContent = `
                .prefers-reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        },

        moderateAnimations() {
            document.body.classList.add('moderate-animations');
            
            // Reduce animation complexity
            const style = document.createElement('style');
            style.textContent = `
                .moderate-animations * {
                    animation-duration: 0.3s !important;
                }
            `;
            document.head.appendChild(style);
        },

        loadLowerQualityImages() {
            document.querySelectorAll('img[data-src-low]').forEach(img => {
                if (img.dataset.srcLow) {
                    img.dataset.src = img.dataset.srcLow;
                }
            });
            
            // Use lower quality srcset
            document.querySelectorAll('img[data-srcset-low]').forEach(img => {
                if (img.dataset.srcsetLow) {
                    img.dataset.srcset = img.dataset.srcsetLow;
                }
            });
        },

        loadMediumQualityImages() {
            document.querySelectorAll('img[data-src-medium]').forEach(img => {
                if (img.dataset.srcMedium) {
                    img.dataset.src = img.dataset.srcMedium;
                }
            });
        },

        disableNonEssentialFeatures() {
            // Disable decorative elements
            document.querySelectorAll('.decorative, .background-effect').forEach(el => {
                el.style.display = 'none';
            });
            
            // Disable WebGL/Canvas animations
            document.querySelectorAll('canvas').forEach(canvas => {
                canvas.style.display = 'none';
            });
            
            // Stop audio
            document.querySelectorAll('audio').forEach(audio => {
                audio.pause();
            });
        },

        loadSelectiveFeatures() {
            // Load only essential interactive features
            document.querySelectorAll('[data-priority="high"]').forEach(el => {
                el.classList.add('enabled');
            });
        },

        enableAllFeatures() {
            // Enable all interactive features
            document.querySelectorAll('[data-feature]').forEach(el => {
                el.classList.add('enabled');
            });
        },

        enableAdvancedAnimations() {
            document.body.classList.add('advanced-animations');
            
            // Enable WebGL/3D effects
            document.querySelectorAll('[data-3d]').forEach(el => {
                el.classList.add('enabled');
            });
        },

        throttleJavaScriptExecution() {
            // Throttle scroll events
            let scrollTimeout;
            const throttledScroll = () => {
                if (scrollTimeout) {
                    window.cancelAnimationFrame(scrollTimeout);
                }
                scrollTimeout = window.requestAnimationFrame(() => {
                    document.dispatchEvent(new CustomEvent('throttledscroll'));
                });
            };
            
            window.addEventListener('scroll', throttledScroll, { passive: true });
        },

        monitorAdaptiveConditions() {
            // Monitor connection changes
            if (navigator.connection) {
                navigator.connection.addEventListener('change', () => {
                    this.detectDeviceCapabilities();
                    this.applyAdaptiveStrategies();
                });
            }
            
            // Monitor media query changes
            const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQueryList.addListener(() => {
                this.detectDeviceCapabilities();
                this.applyAdaptiveStrategies();
            });
        },

        /**
         * Resource Loading Optimization
         */
        optimizeResourceLoading() {
            if (!this.config.enableResourceHints) return;
            
            // Preconnect to critical third-party origins
            this.setupPreconnections();
            
            // DNS prefetch for other domains
            this.setupDNSPrefetch();
            
            // Preload critical resources
            this.preloadCriticalResources();
            
            // Defer non-critical scripts
            this.deferNonCriticalScripts();
            
            // Async load non-blocking scripts
            this.asyncLoadScripts();
        },

        setupPreconnections() {
            const preconnectDomains = [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://www.google-analytics.com',
                'https://www.googletagmanager.com'
            ];

            preconnectDomains.forEach(domain => {
                if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = domain;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                }
            });
        },

        setupDNSPrefetch() {
            const dnsPrefetchDomains = [
                'https://cdnjs.cloudflare.com',
                'https://unpkg.com',
                'https://cdn.jsdelivr.net'
            ];

            dnsPrefetchDomains.forEach(domain => {
                if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'dns-prefetch';
                    link.href = domain;
                    document.head.appendChild(link);
                }
            });
        },

        preloadCriticalResources() {
            // Identify critical resources
            const criticalResources = [
                { href: '/css/critical.css', as: 'style' },
                { href: '/js/critical.js', as: 'script' },
                { href: '/fonts/inter-v12-latin-regular.woff2', as: 'font', type: 'font/woff2' },
                { href: '/fonts/inter-v12-latin-700.woff2', as: 'font', type: 'font/woff2' }
            ];

            criticalResources.forEach(resource => {
                if (!document.querySelector(`link[rel="preload"][href="${resource.href}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = resource.href;
                    link.as = resource.as;
                    
                    if (resource.type) {
                        link.type = resource.type;
                    }
                    
                    if (resource.as === 'font') {
                        link.crossOrigin = 'anonymous';
                    }
                    
                    document.head.appendChild(link);
                    this.criticalResources.add(resource.href);
                }
            });
        },

        deferNonCriticalScripts() {
            document.querySelectorAll('script[data-defer]').forEach(script => {
                script.defer = true;
            });
        },

        asyncLoadScripts() {
            document.querySelectorAll('script[data-async]').forEach(script => {
                script.async = true;
            });
        },

        /**
         * Font Optimization
         */
        optimizeFonts() {
            if (!this.config.enableFontOptimization) return;
            
            // Use font-display: swap for all fonts
            this.setFontDisplay();
            
            // Monitor font loading
            this.monitorFontLoading();
            
            // Preload critical fonts
            this.preloadCriticalFonts();
            
            // Implement FOUT instead of FOIT
            this.implementFOUT();
        },

        setFontDisplay() {
            const style = document.createElement('style');
            style.textContent = `
                @font-face {
                    font-display: swap;
                }
            `;
            document.head.appendChild(style);
        },

        monitorFontLoading() {
            if ('fonts' in document) {
                document.fonts.ready.then(() => {
                    document.body.classList.add('fonts-loaded');
                    console.log('All fonts loaded');
                });
                
                // Monitor individual font loads
                document.fonts.forEach(font => {
                    font.loaded.then(() => {
                        console.log(`Font loaded: ${font.family}`);
                    });
                });
            }
        },

        preloadCriticalFonts() {
            const criticalFonts = [
                '/fonts/inter-v12-latin-regular.woff2',
                '/fonts/inter-v12-latin-700.woff2'
            ];

            criticalFonts.forEach(font => {
                if (!document.querySelector(`link[rel="preload"][href="${font}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'font';
                    link.type = 'font/woff2';
                    link.href = font;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                }
            });
        },

        implementFOUT() {
            // Add class to show fallback fonts immediately
            document.documentElement.classList.add('fonts-loading');
            
            if ('fonts' in document) {
                document.fonts.ready.then(() => {
                    document.documentElement.classList.remove('fonts-loading');
                    document.documentElement.classList.add('fonts-loaded');
                });
            }
        },

        /**
         * Image Optimization
         */
        optimizeImages() {
            if (!this.config.enableImageOptimization) return;
            
            // Detect WebP support
            this.detectWebPSupport();
            
            // Detect AVIF support
            this.detectAVIFSupport();
            
            // Implement responsive images
            this.setupResponsiveImages();
            
            // Optimize image loading priority
            this.prioritizeImageLoading();
        },

        detectWebPSupport() {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                const supportsWebP = webP.height === 2;
                if (supportsWebP) {
                    document.documentElement.classList.add('webp');
                    this.loadWebPImages();
                } else {
                    document.documentElement.classList.add('no-webp');
                }
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        },

        detectAVIFSupport() {
            const avif = new Image();
            avif.onload = avif.onerror = () => {
                const supportsAVIF = avif.height === 2;
                if (supportsAVIF) {
                    document.documentElement.classList.add('avif');
                    this.loadAVIFImages();
                } else {
                    document.documentElement.classList.add('no-avif');
                }
            };
            avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg';
        },

        loadWebPImages() {
            document.querySelectorAll('img[data-webp]').forEach(img => {
                img.src = img.dataset.webp;
            });
            
            document.querySelectorAll('[data-bg-webp]').forEach(el => {
                el.style.backgroundImage = `url(${el.dataset.bgWebp})`;
            });
        },

        loadAVIFImages() {
            document.querySelectorAll('img[data-avif]').forEach(img => {
                img.src = img.dataset.avif;
            });
        },

        setupResponsiveImages() {
            // Generate appropriate srcset for images
            document.querySelectorAll('img[data-responsive]').forEach(img => {
                const src = img.dataset.src || img.src;
                const widths = [320, 640, 768, 1024, 1366, 1920];
                const srcset = widths.map(w => `${src}?w=${w} ${w}w`).join(', ');
                
                img.srcset = srcset;
                img.sizes = img.dataset.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
            });
        },

        prioritizeImageLoading() {
            // High priority for above-the-fold images
            document.querySelectorAll('img[data-priority="high"]').forEach(img => {
                img.loading = 'eager';
                img.fetchPriority = 'high';
            });
            
            // Low priority for below-the-fold images
            document.querySelectorAll('img[data-priority="low"]').forEach(img => {
                img.loading = 'lazy';
                img.fetchPriority = 'low';
            });
        },

        /**
         * Script Optimization
         */
        optimizeScripts() {
            if (!this.config.enableScriptOptimization) return;
            
            // Defer non-critical scripts
            this.deferScripts();
            
            // Async load independent scripts
            this.asyncScripts();
            
            // Implement script loading priorities
            this.prioritizeScripts();
            
            // Remove render-blocking scripts
            this.removeRenderBlockingScripts();
        },

        deferScripts() {
            document.querySelectorAll('script:not([defer]):not([async])').forEach(script => {
                if (!script.src) return; // Skip inline scripts
                
                const priority = script.dataset.priority || 'normal';
                if (priority !== 'critical') {
                    script.defer = true;
                }
            });
        },

        asyncScripts() {
            document.querySelectorAll('script[data-async]').forEach(script => {
                script.async = true;
            });
        },

        prioritizeScripts() {
            // Load critical scripts first
            const criticalScripts = document.querySelectorAll('script[data-priority="critical"]');
            const normalScripts = document.querySelectorAll('script[data-priority="normal"]');
            const lowScripts = document.querySelectorAll('script[data-priority="low"]');
            
            // Ensure execution order
            criticalScripts.forEach(script => {
                script.fetchPriority = 'high';
            });
            
            normalScripts.forEach(script => {
                script.fetchPriority = 'auto';
            });
            
            lowScripts.forEach(script => {
                script.fetchPriority = 'low';
                script.defer = true;
            });
        },

        removeRenderBlockingScripts() {
            // Move scripts to bottom of body if they're in head
            document.querySelectorAll('head script:not([data-critical])').forEach(script => {
                if (script.src && !script.defer && !script.async) {
                    script.defer = true;
                    document.body.appendChild(script);
                }
            });
        },

        /**
         * CSS Optimization
         */
        optimizeCSS() {
            if (!this.config.enableCSSOptimization) return;
            
            // Inline critical CSS
            this.inlineCriticalCSS();
            
            // Load non-critical CSS asynchronously
            this.loadCSSAsync();
            
            // Remove unused CSS
            this.removeUnusedCSS();
            
            // Optimize CSS delivery
            this.optimizeCSSDelivery();
        },

        inlineCriticalCSS() {
            // Critical CSS for above-the-fold content
            const criticalCSS = `
                /* Reset and base styles */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                /* Typography */
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                
                /* Layout */
                .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 0 20px; 
                }
                
                /* Header */
                header { 
                    position: fixed; 
                    top: 0; 
                    width: 100%; 
                    background: white; 
                    z-index: 1000;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                /* Hero */
                .hero { 
                    min-height: 100vh; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                }
                
                /* Buttons */
                .btn { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    border-radius: 4px; 
                    text-decoration: none;
                    transition: opacity 0.3s;
                }
                
                /* Utilities */
                .hidden { display: none !important; }
                .invisible { visibility: hidden; }
            `;
            
            // Check if critical CSS is already inlined
            if (!document.querySelector('style[data-critical]')) {
                const style = document.createElement('style');
                style.setAttribute('data-critical', 'true');
                style.textContent = criticalCSS;
                document.head.insertBefore(style, document.head.firstChild);
            }
        },

        loadCSSAsync() {
            // Convert blocking stylesheets to non-blocking
            document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])').forEach(link => {
                // Create a preload link
                const preload = document.createElement('link');
                preload.rel = 'preload';
                preload.as = 'style';
                preload.href = link.href;
                preload.onload = function() {
                    this.onload = null;
                    this.rel = 'stylesheet';
                };
                
                // Insert preload link
                link.parentNode.insertBefore(preload, link);
                
                // Remove original blocking link
                link.remove();
                
                // Fallback for browsers without preload support
                const fallback = document.createElement('noscript');
                fallback.innerHTML = `<link rel="stylesheet" href="${link.href}">`;
                document.head.appendChild(fallback);
            });
        },

        removeUnusedCSS() {
            // This would typically be done at build time
            // Here we can mark unused rules for debugging
            if (window.location.hostname === 'localhost') {
                console.log('Unused CSS detection enabled (dev mode)');
            }
        },

        optimizeCSSDelivery() {
            // Group media queries
            const mediaQueries = new Map();
            
            document.querySelectorAll('link[rel="stylesheet"][media]').forEach(link => {
                const media = link.media;
                if (!mediaQueries.has(media)) {
                    mediaQueries.set(media, []);
                }
                mediaQueries.get(media).push(link.href);
            });
            
            // Log grouped media queries for optimization
            if (mediaQueries.size > 0) {
                console.log('Media queries detected:', Array.from(mediaQueries.keys()));
            }
        },

        /**
         * Animation Optimization
         */
        optimizeAnimations() {
            // Use will-change for elements about to animate
            this.setupWillChange();
            
            // Respect prefers-reduced-motion
            this.respectReducedMotion();
            
            // Optimize animation performance
            this.optimizeAnimationPerformance();
            
            // Use GPU acceleration wisely
            this.setupGPUAcceleration();
        },

        setupWillChange() {
            const animatedElements = document.querySelectorAll('[data-animate]');
            
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Add will-change before animation
                        entry.target.style.willChange = 'transform, opacity';
                        
                        // Start animation
                        entry.target.classList.add('animate');
                        
                        // Remove will-change after animation
                        entry.target.addEventListener('animationend', () => {
                            entry.target.style.willChange = 'auto';
                        }, { once: true });
                        
                        animationObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });

            animatedElements.forEach(el => {
                animationObserver.observe(el);
            });
        },

        respectReducedMotion() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            const handleReducedMotion = (mq) => {
                if (mq.matches) {
                    this.reduceMotion();
                } else {
                    document.body.classList.remove('prefers-reduced-motion');
                }
            };
            
            handleReducedMotion(mediaQuery);
            mediaQuery.addListener(handleReducedMotion);
        },

        optimizeAnimationPerformance() {
            // Use transform and opacity for animations
            const style = document.createElement('style');
            style.textContent = `
                /* Optimize animations to use only GPU-accelerated properties */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                
                /* Force GPU acceleration */
                .will-animate {
                    will-change: transform, opacity;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                }
            `;
            document.head.appendChild(style);
        },

        setupGPUAcceleration() {
            // Add GPU acceleration to animated elements
            document.querySelectorAll('[data-gpu]').forEach(el => {
                el.style.transform = 'translateZ(0)';
                el.style.backfaceVisibility = 'hidden';
                el.style.perspective = '1000px';
            });
        },

        /**
         * Prefetching and Resource Hints
         */
        aggressivePrefetching() {
            // Prefetch visible links
            this.prefetchVisibleLinks();
            
            // Prefetch on hover
            this.setupHoverPrefetch();
            
            // Prefetch priority resources
            this.prefetchPriorityResources();
            
            // Implement speculative prefetch
            this.speculativePrefetch();
        },

        prefetchVisibleLinks() {
            if (!('requestIdleCallback' in window)) return;
            
            requestIdleCallback(() => {
                const links = document.querySelectorAll('a[href]:not([data-no-prefetch])');
                const visibleLinks = Array.from(links).filter(link => {
                    const rect = link.getBoundingClientRect();
                    return rect.top >= 0 && rect.top <= window.innerHeight;
                });
                
                visibleLinks.slice(0, 3).forEach(link => {
                    this.prefetchPage(link.href);
                });
            });
        },

        setupHoverPrefetch() {
            document.addEventListener('mouseover', (e) => {
                const link = e.target.closest('a[href]');
                if (link && !link.dataset.noPrefetch) {
                    this.prefetchPage(link.href);
                }
            });
        },

        prefetchPage(url) {
            // Don't prefetch external URLs
            if (url.startsWith('http') && !url.includes(window.location.hostname)) {
                return;
            }
            
            // Don't prefetch already prefetched URLs
            if (this.prefetchedUrls.has(url)) {
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
            
            this.prefetchedUrls.add(url);
        },

        prefetchPriorityResources() {
            const priorityResources = [
                '/css/main.css',
                '/js/main.js',
                '/api/data.json'
            ];
            
            priorityResources.forEach(resource => {
                if (!this.prefetchedUrls.has(resource)) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = resource;
                    document.head.appendChild(link);
                    this.prefetchedUrls.add(resource);
                }
            });
        },

        speculativePrefetch() {
            // Prefetch based on user patterns
            const commonPaths = ['/about', '/contact', '/services'];
            
            if ('connection' in navigator && navigator.connection.effectiveType === '4g') {
                requestIdleCallback(() => {
                    commonPaths.forEach(path => {
                        this.prefetchPage(path);
                    });
                });
            }
        },

        /**
         * Page Lifecycle Monitoring
         */
        initPageLifecycle() {
            // Monitor page visibility
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.onPageHidden();
                } else {
                    this.onPageVisible();
                }
            });
            
            // Monitor page freeze/resume (Page Lifecycle API)
            document.addEventListener('freeze', () => {
                this.onPageFreeze();
            });
            
            document.addEventListener('resume', () => {
                this.onPageResume();
            });
            
            // Before unload
            window.addEventListener('beforeunload', () => {
                this.onBeforeUnload();
            });
        },

        onPageHidden() {
            // Pause animations
            document.querySelectorAll('[data-animation]').forEach(el => {
                el.style.animationPlayState = 'paused';
            });
            
            // Stop videos
            document.querySelectorAll('video').forEach(video => {
                video.pause();
            });
        },

        onPageVisible() {
            // Resume animations
            document.querySelectorAll('[data-animation]').forEach(el => {
                el.style.animationPlayState = 'running';
            });
        },

        onPageFreeze() {
            // Prepare for hibernation
            this.cleanup();
        },

        onPageResume() {
            // Restore after hibernation
            this.init();
        },

        onBeforeUnload() {
            // Send any pending metrics
            if (this.config.enableRUM) {
                this.sendMetrics(this.metrics);
            }
        },

        /**
         * Performance Budget Checking
         */
        checkPerformanceBudget(metric, value) {
            const budget = this.config.performanceBudget[metric];
            
            if (budget && value > budget) {
                const violation = {
                    metric,
                    value,
                    budget,
                    exceeded: value - budget,
                    timestamp: Date.now()
                };
                
                this.metrics.budgetViolations.push(violation);
                
                console.warn(`Performance budget exceeded for ${metric}: ${value}ms (budget: ${budget}ms)`);
                
                // Trigger performance degradation warning
                this.onBudgetViolation(violation);
            }
        },

        onBudgetViolation(violation) {
            // Custom event for budget violations
            document.dispatchEvent(new CustomEvent('performancebudgetviolation', {
                detail: violation
            }));
            
            // Take corrective action if needed
            if (violation.metric === 'lcp' && violation.exceeded > 1000) {
                console.warn('Critical LCP violation - applying emergency optimizations');
                this.applyEmergencyOptimizations();
            }
        },

        applyEmergencyOptimizations() {
            // Stop all animations
            this.reduceAnimations();
            
            // Defer all non-critical resources
            document.querySelectorAll('img[loading="eager"]').forEach(img => {
                img.loading = 'lazy';
            });
            
            // Reduce quality settings
            this.applyLowEndOptimizations();
        },

        /**
         * Connection Change Handler
         */
        handleConnectionChange() {
            const connection = navigator.connection || 
                             navigator.mozConnection || 
                             navigator.webkitConnection;
            
            // Update connection info
            this.updateConnectionInfo(connection);
            
            // Re-apply adaptive loading strategies
            this.detectDeviceCapabilities();
            this.applyAdaptiveStrategies();
            
            console.log('Network conditions changed:', this.metrics.connection);
        },

        /**
         * Real User Monitoring (RUM)
         */
        initRUM() {
            // Collect comprehensive metrics
            this.collectRUMMetrics();
            
            // Send metrics periodically
            this.rumInterval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    this.sendMetrics(this.metrics);
                }
            }, 30000); // Every 30 seconds
            
            // Send on page unload
            this.setupUnloadTracking();
        },

        collectRUMMetrics() {
            // Navigation timing
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const navigation = window.performance.navigation;
                
                this.metrics.timing = {
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    loadComplete: timing.loadEventEnd - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart,
                    domComplete: timing.domComplete - timing.navigationStart,
                    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                    tcpConnect: timing.connectEnd - timing.connectStart,
                    request: timing.responseStart - timing.requestStart,
                    response: timing.responseEnd - timing.responseStart,
                    domProcessing: timing.domComplete - timing.domLoading,
                    redirectCount: navigation.redirectCount,
                    navigationType: navigation.type
                };
            }
            
            // Page metadata
            this.metrics.page = {
                url: window.location.href,
                referrer: document.referrer,
                title: document.title,
                timestamp: Date.now(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    colorDepth: window.screen.colorDepth,
                    pixelRatio: window.devicePixelRatio || 1
                }
            };
            
            // User interaction metrics
            this.trackUserInteractions();
        },

        trackUserInteractions() {
            // Track clicks
            document.addEventListener('click', () => {
                this.metrics.interactions++;
            });
            
            // Track scrolls
            let scrolling = false;
            window.addEventListener('scroll', () => {
                if (!scrolling) {
                    scrolling = true;
                    requestAnimationFrame(() => {
                        this.metrics.interactions++;
                        scrolling = false;
                    });
                }
            }, { passive: true });
        },

        setupUnloadTracking() {
            // Use sendBeacon for reliable metric delivery
            const sendFinalMetrics = () => {
                this.collectRUMMetrics();
                this.sendMetrics(this.metrics);
            };
            
            // Try multiple methods for maximum reliability
            if ('sendBeacon' in navigator) {
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') {
                        sendFinalMetrics();
                    }
                });
                
                window.addEventListener('pagehide', sendFinalMetrics);
            }
            
            // Fallback
            window.addEventListener('beforeunload', sendFinalMetrics);
        },

        /**
         * Metrics Reporting
         */
        reportMetric(name, value) {
            const threshold = this.config.performanceBudget[name.toLowerCase()];
            const status = threshold && value <= threshold ? 'good' : 'needs-improvement';
            
            // Console logging with color coding
            const color = status === 'good' ? 'green' : 'orange';
            console.log(`%c[${name}] ${value}ms - ${status}`, `color: ${color}`);
            
            // Send to analytics if configured
            if (this.config.reportToAnalytics && window.gtag) {
                window.gtag('event', 'web_vitals', {
                    metric_name: name,
                    metric_value: value,
                    metric_status: status
                });
            }
        },

        sendMetrics(data) {
            if (!this.config.reportEndpoint) return;
            
            const payload = {
                ...data,
                sessionId: this.metrics.sessionId,
                timestamp: Date.now()
            };
            
            // Use sendBeacon if available
            if ('sendBeacon' in navigator) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(this.config.reportEndpoint, blob);
            } else {
                // Fallback to fetch
                fetch(this.config.reportEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(err => {
                    console.error('Failed to send metrics:', err);
                });
            }
        },

        sendErrorReport(error) {
            if (!this.config.reportEndpoint) return;
            
            const errorEndpoint = this.config.reportEndpoint.replace('/performance', '/errors');
            
            fetch(errorEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error,
                    sessionId: this.metrics.sessionId,
                    timestamp: Date.now()
                }),
                keepalive: true
            }).catch(err => {
                console.error('Failed to send error report:', err);
            });
        },

        /**
         * Fallback Methods
         */
        trackBasicMetrics() {
            const timing = window.performance.timing;
            
            window.addEventListener('load', () => {
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const domReady = timing.domComplete - timing.domLoading;
                const ttfb = timing.responseStart - timing.navigationStart;
                
                console.log(`Page Load Time: ${loadTime}ms`);
                console.log(`DOM Ready: ${domReady}ms`);
                console.log(`TTFB: ${ttfb}ms`);
                
                this.metrics.vitals = { loadTime, domReady, ttfb };
            });
        },

        fallbackLazyLoading() {
            // Simple scroll-based lazy loading for older browsers
            const images = document.querySelectorAll('img[data-src]');
            
            const loadImage = (img) => {
                img.src = img.dataset.src;
                delete img.dataset.src;
            };
            
            const checkImages = () => {
                images.forEach(img => {
                    const rect = img.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        loadImage(img);
                    }
                });
            };
            
            window.addEventListener('scroll', throttle(checkImages, 100));
            window.addEventListener('resize', throttle(checkImages, 100));
            checkImages();
        },

        /**
         * Cleanup
         */
        cleanup() {
            // Disconnect all observers
            this.observers.forEach(observer => observer.disconnect());
            this.observers.clear();
            
            // Clear intervals
            if (this.memoryInterval) {
                clearInterval(this.memoryInterval);
            }
            
            if (this.rumInterval) {
                clearInterval(this.rumInterval);
            }
            
            // Clear sets and maps
            this.lazyLoadTargets.clear();
            this.prefetchedUrls.clear();
            this.criticalResources.clear();
            this.resourceTimings.clear();
            
            console.log('Performance Manager cleanup completed');
        },

        /**
         * Public API
         */
        getMetrics() {
            return this.metrics;
        },

        getVitals() {
            return this.metrics.vitals;
        },

        getErrors() {
            return this.metrics.errors;
        },

        getConnection() {
            return this.metrics.connection;
        },

        getDeviceCapability() {
            return this.metrics.deviceCapability;
        },

        getMemoryUsage() {
            return this.metrics.memory;
        },

        getResourceTimings() {
            return Array.from(this.resourceTimings.values());
        },

        getPerformanceScore() {
            const vitals = this.metrics.vitals;
            const scores = {};
            
            // Calculate individual scores (0-100)
            if (vitals.lcp) {
                scores.lcp = this.calculateScore(vitals.lcp, 2500, 4000);
            }
            
            if (vitals.fid) {
                scores.fid = this.calculateScore(vitals.fid, 100, 300);
            }
            
            if (vitals.cls) {
                scores.cls = this.calculateScore(vitals.cls, 0.1, 0.25);
            }
            
            if (vitals.fcp) {
                scores.fcp = this.calculateScore(vitals.fcp, 1800, 3000);
            }
            
            if (vitals.ttfb) {
                scores.ttfb = this.calculateScore(vitals.ttfb, 800, 1800);
            }
            
            // Calculate overall score
            const validScores = Object.values(scores).filter(s => s !== undefined);
            const overallScore = validScores.length > 0 
                ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                : 0;
            
            return {
                overall: overallScore,
                scores: scores,
                grade: this.getGrade(overallScore)
            };
        },

        calculateScore(value, goodThreshold, poorThreshold) {
            if (value <= goodThreshold) {
                return 100;
            } else if (value >= poorThreshold) {
                return 0;
            } else {
                const range = poorThreshold - goodThreshold;
                const delta = value - goodThreshold;
                return Math.round(100 * (1 - delta / range));
            }
        },

        getGrade(score) {
            if (score >= 90) return 'A';
            if (score >= 80) return 'B';
            if (score >= 70) return 'C';
            if (score >= 60) return 'D';
            return 'F';
        },

        // Manual triggers
        triggerLazyLoad(element) {
            this.loadImage(element);
        },

        prefetchResource(url) {
            this.prefetchPage(url);
        },

        preloadResource(url, type) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = type;
            
            if (type === 'font') {
                link.crossOrigin = 'anonymous';
            }
            
            document.head.appendChild(link);
        },

        // Configuration updates
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            console.log('Performance Manager config updated');
        },

        // Enable/disable features
        enableFeature(feature) {
            this.config[`enable${feature}`] = true;
            this[`init${feature}`]();
        },

        disableFeature(feature) {
            this.config[`enable${feature}`] = false;
        }
    };

    // Helper function to generate session ID
    function generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Helper function for throttling
    function throttle(func, wait) {
        let timeout;
        let previous = 0;
        
        return function() {
            const now = Date.now();
            const remaining = wait - (now - previous);
            const context = this;
            const args = arguments;
            
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(context, args);
                }, remaining);
            }
        };
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            PerformanceManager.init();
        });
    } else {
        PerformanceManager.init();
    }

    // Expose to global scope for debugging and API access
    window.PerformanceManager = PerformanceManager;

    // Utility functions for external use
    window.performanceUtils = {
        markNavigationTiming: (label) => {
            if ('performance' in window && 'mark' in window.performance) {
                window.performance.mark(label);
            }
        },
        
        measureNavigationTiming: (label, startMark, endMark) => {
            if ('performance' in window && 'measure' in window.performance) {
                window.performance.measure(label, startMark, endMark);
            }
        },
        
        getMetrics: () => PerformanceManager.getMetrics(),
        getScore: () => PerformanceManager.getPerformanceScore(),
        prefetch: (url) => PerformanceManager.prefetchResource(url),
        preload: (url, type) => PerformanceManager.preloadResource(url, type)
    };

})();