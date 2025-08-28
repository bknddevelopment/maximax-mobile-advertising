/**
 * Advanced Particle Effects System for MaxiMax Advertising
 * High-performance canvas-based particle system with multiple effect types
 */

class ParticleSystem {
    constructor(options = {}) {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = options.maxParticles || 500;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        this.animationId = null;
        
        // Performance detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isLowPerformance = this.isMobile || navigator.hardwareConcurrency <= 2;
        
        // Adjust particle count for performance
        if (this.isLowPerformance) {
            this.maxParticles = Math.floor(this.maxParticles * 0.5);
        }
        
        // Mouse tracking for hover effects
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isMouseMoving = false;
        
        // Effect configurations
        this.effects = {
            confetti: {
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCB77'],
                gravity: 0.3,
                friction: 0.99,
                wind: 0.01,
                rotationSpeed: 0.1
            },
            sparkle: {
                colors: ['#FFD700', '#FFF8DC', '#FFFACD', '#F0E68C'],
                lifespan: 60,
                size: 3,
                twinkleSpeed: 0.05
            },
            bubble: {
                colors: ['rgba(255,255,255,0.3)', 'rgba(200,200,255,0.2)', 'rgba(150,150,255,0.2)'],
                speed: 0.5,
                wobble: 0.02,
                maxSize: 20
            },
            firework: {
                colors: ['#FF1744', '#F50057', '#D500F9', '#651FFF', '#3D5AFE', '#00B8D4'],
                gravity: 0.05,
                explosionForce: 8,
                sparkCount: 30,
                trailLength: 5
            },
            snow: {
                color: 'rgba(255,255,255,0.8)',
                speed: 1,
                wind: 0.01,
                wobble: 0.02,
                size: 3
            },
            rain: {
                color: 'rgba(174,194,224,0.5)',
                speed: 10,
                wind: 0.02,
                width: 2,
                length: 20
            }
        };
        
        this.init();
    }
    
    init() {
        // Create and setup canvas
        this.createCanvas();
        this.setupEventListeners();
        this.initParticlePool();
        
        // Start animation loop
        this.start();
        
        // Setup visibility change detection
        this.setupVisibilityDetection();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Add to body
        document.body.appendChild(this.canvas);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.isMouseMoving = true;
            
            clearTimeout(this.mouseStopTimeout);
            this.mouseStopTimeout = setTimeout(() => {
                this.isMouseMoving = false;
            }, 100);
        });
        
        // Touch support for mobile
        if (this.isMobile) {
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    this.lastMouseX = this.mouseX;
                    this.lastMouseY = this.mouseY;
                    this.mouseX = touch.clientX;
                    this.mouseY = touch.clientY;
                }
            });
        }
    }
    
    setupVisibilityDetection() {
        // Page visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Intersection Observer for canvas visibility
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        this.pause();
                    } else {
                        this.resume();
                    }
                });
            });
            observer.observe(this.canvas);
        }
    }
    
    initParticlePool() {
        // Pre-create particles for object pooling
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(new Particle());
        }
    }
    
    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return null;
    }
    
    returnParticleToPool(particle) {
        particle.reset();
        if (this.particlePool.length < this.maxParticles) {
            this.particlePool.push(particle);
        }
    }
    
    // Effect creation methods
    createConfetti(x, y, count = 50) {
        const config = this.effects.confetti;
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            particle.type = 'confetti';
            particle.x = x;
            particle.y = y;
            particle.vx = (Math.random() - 0.5) * 10;
            particle.vy = Math.random() * -10 - 5;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.size = Math.random() * 8 + 4;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;
            particle.life = 100;
            particle.maxLife = 100;
            particle.gravity = config.gravity;
            particle.friction = config.friction;
            particle.wind = (Math.random() - 0.5) * config.wind;
            
            this.particles.push(particle);
        }
    }
    
    createSparkle(x, y, count = 10) {
        const config = this.effects.sparkle;
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            particle.type = 'sparkle';
            particle.x = x + (Math.random() - 0.5) * 20;
            particle.y = y + (Math.random() - 0.5) * 20;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = (Math.random() - 0.5) * 2;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.size = Math.random() * config.size + 1;
            particle.life = config.lifespan;
            particle.maxLife = config.lifespan;
            particle.twinkle = Math.random() * Math.PI * 2;
            particle.twinkleSpeed = config.twinkleSpeed;
            
            this.particles.push(particle);
        }
    }
    
    createBubbles(count = 5) {
        const config = this.effects.bubble;
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            particle.type = 'bubble';
            particle.x = Math.random() * this.canvas.width;
            particle.y = this.canvas.height + 50;
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = -config.speed - Math.random() * 0.5;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.size = Math.random() * config.maxSize + 5;
            particle.wobble = Math.random() * Math.PI * 2;
            particle.wobbleSpeed = config.wobble;
            particle.life = 500;
            particle.maxLife = 500;
            
            this.particles.push(particle);
        }
    }
    
    createFirework(x, y) {
        const config = this.effects.firework;
        
        // Create rocket trail
        const rocket = this.getParticleFromPool();
        if (!rocket) return;
        
        rocket.type = 'rocket';
        rocket.x = x;
        rocket.y = this.canvas.height;
        rocket.targetY = y;
        rocket.vx = 0;
        rocket.vy = -15;
        rocket.color = '#FFF';
        rocket.size = 3;
        rocket.trail = [];
        rocket.life = 100;
        rocket.maxLife = 100;
        
        // Store explosion data for when rocket reaches target
        rocket.onExplode = () => {
            // Create explosion
            for (let i = 0; i < config.sparkCount; i++) {
                const spark = this.getParticleFromPool();
                if (!spark) break;
                
                const angle = (Math.PI * 2 * i) / config.sparkCount + Math.random() * 0.5;
                const force = config.explosionForce + Math.random() * 3;
                
                spark.type = 'spark';
                spark.x = x;
                spark.y = y;
                spark.vx = Math.cos(angle) * force;
                spark.vy = Math.sin(angle) * force;
                spark.color = config.colors[Math.floor(Math.random() * config.colors.length)];
                spark.size = Math.random() * 3 + 1;
                spark.trail = [];
                spark.life = 60;
                spark.maxLife = 60;
                spark.gravity = config.gravity;
                
                this.particles.push(spark);
            }
            
            // Create flash effect
            this.createFlash(x, y);
        };
        
        this.particles.push(rocket);
    }
    
    createFlash(x, y) {
        const flash = this.getParticleFromPool();
        if (!flash) return;
        
        flash.type = 'flash';
        flash.x = x;
        flash.y = y;
        flash.size = 1;
        flash.maxSize = 100;
        flash.growthRate = 10;
        flash.color = 'rgba(255,255,255,0.8)';
        flash.life = 10;
        flash.maxLife = 10;
        
        this.particles.push(flash);
    }
    
    createSnow(count = 2) {
        const config = this.effects.snow;
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            particle.type = 'snow';
            particle.x = Math.random() * (this.canvas.width + 100) - 50;
            particle.y = -20;
            particle.vx = config.wind;
            particle.vy = config.speed + Math.random() * 0.5;
            particle.color = config.color;
            particle.size = Math.random() * config.size + 1;
            particle.wobble = Math.random() * Math.PI * 2;
            particle.wobbleSpeed = config.wobble;
            particle.life = 1000;
            particle.maxLife = 1000;
            
            this.particles.push(particle);
        }
    }
    
    createRain(count = 5) {
        const config = this.effects.rain;
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            particle.type = 'rain';
            particle.x = Math.random() * (this.canvas.width + 200) - 100;
            particle.y = -50;
            particle.vx = config.wind;
            particle.vy = config.speed + Math.random() * 5;
            particle.color = config.color;
            particle.width = config.width;
            particle.length = config.length + Math.random() * 10;
            particle.life = 200;
            particle.maxLife = 200;
            
            this.particles.push(particle);
        }
    }
    
    createClickExplosion(x, y) {
        // Combination of confetti and sparkles
        this.createConfetti(x, y, 20);
        this.createSparkle(x, y, 15);
        this.createFlash(x, y);
    }
    
    createHoverTrail() {
        if (this.isMouseMoving && Math.random() > 0.3) {
            this.createSparkle(this.mouseX, this.mouseY, 2);
        }
    }
    
    createScrollParticles(scrollY) {
        // Emit particles based on scroll speed
        const scrollSpeed = Math.abs(scrollY - (this.lastScrollY || 0));
        this.lastScrollY = scrollY;
        
        if (scrollSpeed > 10 && Math.random() > 0.7) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.createSparkle(x, y, Math.floor(scrollSpeed / 10));
        }
    }
    
    // Update and render
    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update based on particle type
            switch (particle.type) {
                case 'confetti':
                    this.updateConfetti(particle);
                    break;
                case 'sparkle':
                    this.updateSparkle(particle);
                    break;
                case 'bubble':
                    this.updateBubble(particle);
                    break;
                case 'rocket':
                    this.updateRocket(particle);
                    break;
                case 'spark':
                    this.updateSpark(particle);
                    break;
                case 'flash':
                    this.updateFlash(particle);
                    break;
                case 'snow':
                    this.updateSnow(particle);
                    break;
                case 'rain':
                    this.updateRain(particle);
                    break;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Decrease life
            particle.life--;
            
            // Remove dead particles or particles out of bounds
            if (particle.life <= 0 || 
                particle.y > this.canvas.height + 100 ||
                particle.x < -100 || 
                particle.x > this.canvas.width + 100) {
                this.particles.splice(i, 1);
                this.returnParticleToPool(particle);
            }
        }
    }
    
    updateConfetti(particle) {
        particle.vy += particle.gravity;
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        particle.vx += particle.wind;
        particle.rotation += particle.rotationSpeed;
    }
    
    updateSparkle(particle) {
        particle.twinkle += particle.twinkleSpeed;
        particle.alpha = Math.abs(Math.sin(particle.twinkle));
    }
    
    updateBubble(particle) {
        particle.wobble += particle.wobbleSpeed;
        particle.vx = Math.sin(particle.wobble) * 0.5;
    }
    
    updateRocket(particle) {
        // Add to trail
        if (particle.trail.length > 10) particle.trail.shift();
        particle.trail.push({ x: particle.x, y: particle.y });
        
        // Check if reached target
        if (particle.y <= particle.targetY) {
            if (particle.onExplode) particle.onExplode();
            particle.life = 0;
        }
    }
    
    updateSpark(particle) {
        if (particle.gravity) {
            particle.vy += particle.gravity;
        }
        
        // Add to trail
        if (particle.trail) {
            if (particle.trail.length > 5) particle.trail.shift();
            particle.trail.push({ x: particle.x, y: particle.y });
        }
    }
    
    updateFlash(particle) {
        if (particle.size < particle.maxSize) {
            particle.size += particle.growthRate;
        }
    }
    
    updateSnow(particle) {
        particle.wobble += particle.wobbleSpeed;
        particle.vx = Math.sin(particle.wobble) * 0.5;
    }
    
    updateRain(particle) {
        // Rain just falls straight with slight wind
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render all particles
        for (const particle of this.particles) {
            this.ctx.save();
            
            switch (particle.type) {
                case 'confetti':
                    this.renderConfetti(particle);
                    break;
                case 'sparkle':
                    this.renderSparkle(particle);
                    break;
                case 'bubble':
                    this.renderBubble(particle);
                    break;
                case 'rocket':
                case 'spark':
                    this.renderTrailParticle(particle);
                    break;
                case 'flash':
                    this.renderFlash(particle);
                    break;
                case 'snow':
                    this.renderSnow(particle);
                    break;
                case 'rain':
                    this.renderRain(particle);
                    break;
            }
            
            this.ctx.restore();
        }
    }
    
    renderConfetti(particle) {
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    }
    
    renderSparkle(particle) {
        this.ctx.globalAlpha = particle.alpha || (particle.life / particle.maxLife);
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        
        // Draw star shape
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = particle.x + Math.cos(angle) * particle.size;
            const y = particle.y + Math.sin(angle) * particle.size;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = particle.x + Math.cos(innerAngle) * (particle.size * 0.5);
            const innerY = particle.y + Math.sin(innerAngle) * (particle.size * 0.5);
            this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    renderBubble(particle) {
        this.ctx.globalAlpha = particle.life / particle.maxLife * 0.6;
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Add shine effect
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, 
                    particle.size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderTrailParticle(particle) {
        // Render trail
        if (particle.trail && particle.trail.length > 1) {
            this.ctx.strokeStyle = particle.color;
            this.ctx.lineWidth = particle.size;
            this.ctx.lineCap = 'round';
            
            for (let i = 0; i < particle.trail.length - 1; i++) {
                this.ctx.globalAlpha = (i / particle.trail.length) * (particle.life / particle.maxLife);
                this.ctx.beginPath();
                this.ctx.moveTo(particle.trail[i].x, particle.trail[i].y);
                this.ctx.lineTo(particle.trail[i + 1].x, particle.trail[i + 1].y);
                this.ctx.stroke();
            }
        }
        
        // Render particle
        this.ctx.globalAlpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderFlash(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, `rgba(255,255,255,${particle.life / particle.maxLife})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderSnow(particle) {
        this.ctx.globalAlpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = 'rgba(255,255,255,0.5)';
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderRain(particle) {
        this.ctx.globalAlpha = particle.life / particle.maxLife;
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = particle.width;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(particle.x + particle.vx * 2, particle.y + particle.length);
        this.ctx.stroke();
    }
    
    // Animation loop
    animate(currentTime) {
        if (this.isPaused) return;
        
        // Calculate delta time for smooth animation
        if (!this.lastTime) this.lastTime = currentTime;
        this.deltaTime = currentTime - this.lastTime;
        
        // Limit frame rate for performance
        if (this.deltaTime > this.fpsInterval) {
            this.lastTime = currentTime - (this.deltaTime % this.fpsInterval);
            
            // Update and render
            this.update(this.deltaTime);
            this.render();
        }
        
        // Continue animation loop
        if (this.isRunning) {
            this.animationId = requestAnimationFrame((time) => this.animate(time));
        }
    }
    
    // Control methods
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.animate(performance.now());
        }
    }
    
    pause() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now();
            this.animate(this.lastTime);
        }
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particlePool = [];
    }
    
    // Public API for triggering effects
    triggerConfetti(x, y, count) {
        this.createConfetti(x || this.canvas.width / 2, y || this.canvas.height / 2, count);
    }
    
    triggerFirework(x, y) {
        this.createFirework(x || Math.random() * this.canvas.width, 
                           y || this.canvas.height * 0.3);
    }
    
    startSnow() {
        this.snowInterval = setInterval(() => {
            this.createSnow(2);
        }, 200);
    }
    
    stopSnow() {
        if (this.snowInterval) {
            clearInterval(this.snowInterval);
            this.snowInterval = null;
        }
    }
    
    startRain() {
        this.rainInterval = setInterval(() => {
            this.createRain(3);
        }, 100);
    }
    
    stopRain() {
        if (this.rainInterval) {
            clearInterval(this.rainInterval);
            this.rainInterval = null;
        }
    }
    
    startBubbles() {
        this.bubbleInterval = setInterval(() => {
            this.createBubbles(1);
        }, 500);
    }
    
    stopBubbles() {
        if (this.bubbleInterval) {
            clearInterval(this.bubbleInterval);
            this.bubbleInterval = null;
        }
    }
    
    enableHoverEffects() {
        this.hoverEffectsEnabled = true;
        this.hoverInterval = setInterval(() => {
            if (this.hoverEffectsEnabled) {
                this.createHoverTrail();
            }
        }, 50);
    }
    
    disableHoverEffects() {
        this.hoverEffectsEnabled = false;
        if (this.hoverInterval) {
            clearInterval(this.hoverInterval);
            this.hoverInterval = null;
        }
    }
}

// Particle class
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.type = '';
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 1;
        this.color = '#FFF';
        this.life = 100;
        this.maxLife = 100;
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.gravity = 0;
        this.friction = 1;
        this.wind = 0;
        this.wobble = 0;
        this.wobbleSpeed = 0;
        this.twinkle = 0;
        this.twinkleSpeed = 0;
        this.trail = null;
        this.targetY = 0;
        this.onExplode = null;
        this.width = 1;
        this.length = 10;
        this.maxSize = 100;
        this.growthRate = 1;
    }
}

// Initialize and setup particle system
let particleSystem;

document.addEventListener('DOMContentLoaded', () => {
    // Create particle system instance
    particleSystem = new ParticleSystem({
        maxParticles: 500
    });
    
    // Setup interaction triggers
    setupInteractionTriggers();
    
    // Optional: Start ambient effects
    // particleSystem.startBubbles();
    // particleSystem.enableHoverEffects();
});

// Setup interaction triggers
function setupInteractionTriggers() {
    // Click explosions on buttons
    document.addEventListener('click', (e) => {
        // Check if clicked element is a button or has button class
        if (e.target.tagName === 'BUTTON' || 
            e.target.classList.contains('btn') ||
            e.target.classList.contains('cta-button')) {
            particleSystem.createClickExplosion(e.clientX, e.clientY);
        }
    });
    
    // Form submission celebrations
    document.addEventListener('submit', (e) => {
        // Get form position
        const rect = e.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Trigger celebration
        particleSystem.triggerConfetti(centerX, centerY, 100);
        
        // Multiple fireworks
        setTimeout(() => {
            particleSystem.triggerFirework(centerX - 100, centerY);
        }, 200);
        setTimeout(() => {
            particleSystem.triggerFirework(centerX + 100, centerY);
        }, 400);
        setTimeout(() => {
            particleSystem.triggerFirework(centerX, centerY - 50);
        }, 600);
    });
    
    // Scroll-triggered particles
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            particleSystem.createScrollParticles(window.scrollY);
        }, 50);
    });
    
    // Hover effects on special elements
    const hoverElements = document.querySelectorAll('.hover-sparkle, .feature-card, .pricing-card');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            particleSystem.createSparkle(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                20
            );
        });
    });
    
    // Success state triggers
    window.addEventListener('success-state', (e) => {
        const { x, y } = e.detail || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        particleSystem.triggerConfetti(x, y, 50);
    });
    
    // Major CTA fireworks
    const majorCTAs = document.querySelectorAll('.hero-cta, .main-cta, .primary-action');
    majorCTAs.forEach(cta => {
        cta.addEventListener('click', (e) => {
            setTimeout(() => {
                particleSystem.triggerFirework(e.clientX, e.clientY);
            }, 100);
        });
    });
}

// Public API for manual control
window.ParticleEffects = {
    confetti: (x, y, count) => particleSystem?.triggerConfetti(x, y, count),
    firework: (x, y) => particleSystem?.triggerFirework(x, y),
    sparkle: (x, y, count) => particleSystem?.createSparkle(x, y, count),
    startSnow: () => particleSystem?.startSnow(),
    stopSnow: () => particleSystem?.stopSnow(),
    startRain: () => particleSystem?.startRain(),
    stopRain: () => particleSystem?.stopRain(),
    startBubbles: () => particleSystem?.startBubbles(),
    stopBubbles: () => particleSystem?.stopBubbles(),
    enableHover: () => particleSystem?.enableHoverEffects(),
    disableHover: () => particleSystem?.disableHoverEffects(),
    pause: () => particleSystem?.pause(),
    resume: () => particleSystem?.resume(),
    stop: () => particleSystem?.stop(),
    destroy: () => particleSystem?.destroy()
};

// Seasonal effects detection (optional)
const month = new Date().getMonth();
const day = new Date().getDate();

// Winter season (December - February)
if (month === 11 || month === 0 || month === 1) {
    // Enable snow effect in winter
    setTimeout(() => {
        particleSystem?.startSnow();
    }, 2000);
}

// Rainy season (March - April)
if (month === 2 || month === 3) {
    // Enable rain effect occasionally
    if (Math.random() > 0.7) {
        setTimeout(() => {
            particleSystem?.startRain();
            setTimeout(() => {
                particleSystem?.stopRain();
            }, 10000); // Stop after 10 seconds
        }, 3000);
    }
}

// Special dates fireworks
if ((month === 0 && day === 1) || // New Year
    (month === 6 && day === 4) || // Independence Day
    (month === 11 && day === 31)) { // New Year's Eve
    // Celebration fireworks
    setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.5;
        particleSystem?.triggerFirework(x, y);
    }, 3000);
}

console.log('MaxiMax Particle System loaded successfully!');
console.log('Available commands: ParticleEffects.confetti(), .firework(), .sparkle(), .startSnow(), .startRain(), .startBubbles()');