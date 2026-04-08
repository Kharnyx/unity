(function () {
    document.getElementById('year').textContent = new Date().getFullYear();


    let canvas, ctx, width, height, particles = [];
    let scrollSpeed = 0;
    let targetScrollSpeed = 0;
    let lastScrollY = window.scrollY;

    let activeMagnet = null;
    let lastMagnetPos = null; // To remember where to explode from

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || "186, 135, 234";

    // Dynamic Scroll Handling
    const navLinks = document.querySelectorAll(".header-inner .nav a, .header-inner .brand");

    // Email Handling
    const emailPill = document.querySelector(".email-pill");
    if (emailPill) {
        emailPill.addEventListener("click", (e) => {
            e.preventDefault();
            const recipient = "kharnyx3@gmail.com";
            const subject = "Inquiry regarding Unity Assets";
            window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}`;
        });
    }

    // Search Functionality
    const searchInput = document.getElementById('asset-search');
    const resultsCount = document.getElementById('results-count');
    const noResultsMsg = document.getElementById('no-results');
    const cards = document.querySelectorAll('.model-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            let visibleCount = 0;

            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();

                if (title.includes(query) || description.includes(query)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update UI states
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';

            if (query === "") {
                resultsCount.textContent = "Showing all assets";
            } else {
                resultsCount.textContent = `Found ${visibleCount} matching asset${visibleCount !== 1 ? 's' : ''}`;
            }
        });
    }

    // Mouse-tracking parallax effect
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5) * 15;
                const y = (e.clientY / window.innerHeight - 0.5) * 15;

                document.documentElement.style.setProperty('--px', `${x}px`);
                document.documentElement.style.setProperty('--py', `${y}px`);
                ticking = false;
            });
            ticking = true;
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Only trigger for internal anchor links
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                const header = document.querySelector('.header');

                if (targetElement && header) {
                    // Calculate the actual height of the header right now
                    const headerHeight = header.offsetHeight;

                    // Calculate the element's position relative to the document
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

                    // Scroll to the position minus the dynamic header height (plus 20px breathing room)
                    window.scrollTo({
                        top: elementPosition - headerHeight - 34,
                        behavior: 'smooth'
                    });

                    // Update URL hash without jumping
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    const modelCards = document.querySelectorAll(".model-card");

    modelCards.forEach(card => {
        const slider = card.querySelector(".preview-slider");
        if (!slider) return;

        const images = slider.querySelectorAll("img");
        if (images.length <= 1) return;

        let currentIndex = 0;

        // Create Arrow Navigation
        const nav = document.createElement("div");
        nav.classList.add("preview-nav");

        const prevBtn = document.createElement("button");
        prevBtn.className = "nav-arrow";
        prevBtn.innerHTML = "←";

        const nextBtn = document.createElement("button");
        nextBtn.className = "nav-arrow";
        nextBtn.innerHTML = "→";

        // Create Dots Navigation
        const dotsContainer = document.createElement("div");
        dotsContainer.classList.add("dots-navigation");

        images.forEach((_, idx) => {
            const dot = document.createElement("button");
            dot.className = `dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener("click", (e) => {
                e.preventDefault();
                updateSlider(idx);
            });
            dotsContainer.appendChild(dot);
        });

        const updateSlider = (newIndex) => {
            if (newIndex < 0) newIndex = images.length - 1;
            if (newIndex >= images.length) newIndex = 0;

            currentIndex = newIndex;

            // Update Images
            images.forEach((img, idx) => {
                img.classList.toggle("active", idx === currentIndex);
            });

            // Update Dots
            dotsContainer.querySelectorAll(".dot").forEach((dot, idx) => {
                dot.classList.toggle("active", idx === currentIndex);
            });
        };

        prevBtn.addEventListener("click", (e) => {
            e.preventDefault();
            updateSlider(currentIndex - 1);
        });

        nextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            updateSlider(currentIndex + 1);
        });

        // Assemble the UI
        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);

        const preview = card.querySelector(".preview");
        preview.appendChild(nav);
        preview.appendChild(dotsContainer);
    });

    // Find all buttons with the pulse effect
    const pulseButtons = document.querySelectorAll('.open-asset-store');

    pulseButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const rect = btn.getBoundingClientRect();
            activeMagnet = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        });
        btn.addEventListener('mouseleave', () => {
            activeMagnet = null;
        });
    });

    // Initialize canvas settings and event listeners
    function init() {
        canvas = document.getElementById('bg-particles');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 120; i++) particles.push(new Particle());

        // Call the listener setup
        setupMagnetListeners();

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            targetScrollSpeed = (currentScrollY - lastScrollY) * 0.5;
            lastScrollY = currentScrollY;

            if (activeMagnet) {
                const hoveredBtn = document.querySelector('.open-asset-store:hover');
                if (hoveredBtn) {
                    const rect = hoveredBtn.getBoundingClientRect();
                    // Update position of hoveredBtn on scroll
                    activeMagnet = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                        width: rect.width,
                        height: rect.height
                    };
                }
            }
        });
        animate();
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * height;
            this.displayOpacity = this.opacity;
            this.vx = 0;
            this.vy = 0;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -50;
            this.vx = 0;
            this.vy = 0;
            this.direction = (Math.random() * 10 + 58) * (Math.PI / 180);
            this.size = Math.random() * 1.2 + 0.5;
            this.baseSpeed = Math.random() * 0.4 + 0.2;
            this.opacity = Math.random() * 0.2 + 0.1; // Slightly lower base opacity
            this.displayOpacity = this.opacity;
            this.targetRadius = Math.random() * 15 - 3;
            this.isExploding = false;
            this.isNearMagnet = false; // Track for glow effect
        }

        // Pull particles to the button
        spawnAround(targetX, targetY) {
            const spawnRadius = Math.random() * 10 + 120; // Distance they spawn at before being "sucked in"
            const angle = Math.random() * Math.PI * 2;
            this.x = targetX + Math.cos(angle) * spawnRadius;
            this.y = targetY + Math.sin(angle) * spawnRadius;
            this.displayOpacity = 0; // Fade in
            this.isExploding = false;
            this.vx = 0;
            this.vy = 0;
        }

        update() {
            scrollSpeed += (targetScrollSpeed - scrollSpeed) * 0.1;
            this.isNearMagnet = false;

            if (activeMagnet) {
                const offset = this.targetRadius;
                const halfW = (activeMagnet.width / 2) + offset;
                const halfH = (activeMagnet.height / 2) + offset;
                const cornerRadius = 24;

                const posX = this.x - activeMagnet.x;
                const posY = this.y - activeMagnet.y;

                const clampX = Math.max(-halfW + cornerRadius, Math.min(posX, halfW - cornerRadius));
                const clampY = Math.max(-halfH + cornerRadius, Math.min(posY, halfH - cornerRadius));

                const dx = posX - clampX;
                const dy = posY - clampY;
                const mag = Math.sqrt(dx * dx + dy * dy) || 1;
                const distToEdge = mag - cornerRadius;

                if (distToEdge < 150) {
                    this.isNearMagnet = true;
                    const attractionForce = 0.15; // "Sucking" strength
                    this.x -= (dx / mag) * distToEdge * attractionForce;
                    this.y -= (dy / mag) * distToEdge * attractionForce;

                    const direction = this.targetRadius > 20 ? -1 : 1;
                    const orbitSpeed = (3.0 + (this.baseSpeed * 2)) * direction;
                    const margin = 5;

                    // Orbit logic
                    if (posY <= -halfH + margin && posX < halfW - cornerRadius) {
                        this.x += orbitSpeed;
                    } else if (posX >= halfW - margin && posY < halfH - cornerRadius) {
                        this.y += orbitSpeed;
                    } else if (posY >= halfH - margin && posX > -halfW + cornerRadius) {
                        this.x -= orbitSpeed;
                    } else if (posX <= -halfW + margin && posY > -halfH + cornerRadius) {
                        this.y -= orbitSpeed;
                    } else {
                        this.x += (posY > 0 ? -orbitSpeed : orbitSpeed);
                        this.y += (posX > 0 ? orbitSpeed : -orbitSpeed);
                    }

                    const proximityGlow = Math.max(0, 1 - Math.abs(distToEdge) / 30);
                    this.displaySize = this.size * (1.2 + proximityGlow * 2);
                    this.displayOpacity = Math.min(this.displayOpacity + 0.1, 0.8);
                    this.lastDx = dx;
                    this.lastDy = dy;
                    this.isExploding = true;
                } else {
                    this.standardMove();
                }
            } else if (this.isExploding) {
                if (this.vx === 0 && this.vy === 0) {
                    const angle = (this.lastDx !== undefined)
                        ? Math.atan2(this.lastDy, this.lastDx)
                        : Math.random() * Math.PI * 2;

                    const spread = (Math.random() - 0.5) * 0.5;
                    const finalAngle = angle + spread;
                    const speed = Math.random() * 10 + 5;
                    this.vx = Math.cos(finalAngle) * speed;
                    this.vy = Math.sin(finalAngle) * speed;
                    this.shouldReset = Math.random() > 0.6;
                }

                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.94;
                this.vy *= 0.94;
                this.displayOpacity *= 0.96;

                if (this.displayOpacity < 0.05) {
                    this.isExploding = false;
                    if (this.shouldReset) this.reset();
                }
            } else {
                this.standardMove();
            }

            if (this.y > height + 50) this.reset();
        }

        standardMove() {
            this.x += Math.cos(this.direction) * this.baseSpeed;
            this.y += Math.sin(this.direction) * this.baseSpeed + Math.abs(scrollSpeed * 0.2);
            this.displaySize = this.size;
            this.displayOpacity += (this.opacity - this.displayOpacity) * 0.05;
            this.stretch = Math.min(Math.abs(scrollSpeed) * (1 - this.displayOpacity) * 0.5, 25);
        }

        draw(accentColor) {
            const alpha = Math.max(0, Math.min(1, this.displayOpacity));

            if (this.isNearMagnet) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';

                // Broad outer glow
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${accentColor}, ${alpha * 0.3})`;
                ctx.lineWidth = this.displaySize * 3;
                ctx.lineCap = 'round';
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.vx * 0.8, this.y - this.vy * 0.8);
                ctx.stroke();

                // White hot core
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 1.75})`;
                ctx.lineWidth = this.displaySize * 0.8;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.vx * 0.5, this.y - this.vy * 0.5);
                ctx.stroke();

                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${accentColor}, ${alpha})`;
                ctx.lineWidth = this.displaySize;
                ctx.lineCap = 'round';
                ctx.moveTo(this.x, this.y);
                const s = this.isExploding ? 1 : 2 + this.stretch;
                ctx.lineTo(this.x, this.y + s);
                ctx.stroke();
            }
        }
    }

    function setupMagnetListeners() {
        const pulseButtons = document.querySelectorAll('.open-asset-store');

        pulseButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const rect = btn.getBoundingClientRect();
                activeMagnet = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    width: rect.width,
                    height: rect.height
                };

                // Forcefully "suck" 20 particles to the button
                let count = 0;
                for (let p of particles) {
                    if (!p.isNearMagnet && count < 25) {
                        p.spawnAround(activeMagnet.x, activeMagnet.y);
                        count++;
                    }
                }
            });

            btn.addEventListener('mouseleave', () => {
                activeMagnet = null;
            });
        });
    }

    // Render volumetric light beams with a pulsing opacity
    function drawGodRays() {
        const time = Date.now() * 0.0005;
        const rays = [
            { x: width * 0.75, w: 90, op: 0.03 },
            { x: width * 0.90, w: 140, op: 0.07 },
            { x: width * 1.10, w: 110, op: 0.06 }
        ];

        rays.forEach((ray, i) => {
            const pulse = Math.sin(time + i) * 0.02;
            const grad = ctx.createLinearGradient(ray.x, 0, ray.x - 500, height);

            grad.addColorStop(0, `rgba(255, 255, 255, ${ray.op + pulse})`);
            grad.addColorStop(0.2, `rgba(255, 255, 255, ${(ray.op + pulse) * 0.25})`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(ray.x, 0);
            ctx.lineTo(ray.x + ray.w, 0);
            ctx.lineTo(ray.x + ray.w - 800, height);
            ctx.lineTo(ray.x - 800, height);
            ctx.fill();
        });
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        targetScrollSpeed *= 0.9;

        drawGodRays();
        particles.forEach(p => {
            p.update();
            p.draw(accentColor);
        });
        requestAnimationFrame(animate);
    }

    window.onload = init;
})();
