/**
 * PlayNewApps - Main JavaScript File
 * Vanilla JS Implementation - Performance & UX Optimized
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Set Current Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 1. Loading Animation Removal (Graceful)
    const loader = document.getElementById('loader');
    if (loader) {
        // Fallback max wait
        window.addEventListener('load', removeLoader);
        setTimeout(removeLoader, 3000); 
    }

    function removeLoader() {
        if (!loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }

    // 2. Theme Toggle (Dark/Light Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('.material-icons-round');

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = 'light_mode';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeIcon.textContent = 'light_mode';
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            themeIcon.textContent = 'dark_mode';
            localStorage.setItem('theme', 'light');
        }
    });

    // 3. Mobile Menu Toggle (Accessibility Improved)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('nav');
    const menuIcon = mobileMenuBtn.querySelector('.material-icons-round');

    function toggleMenu() {
        const isActive = nav.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', isActive);
        
        if (isActive) {
            menuIcon.textContent = 'close';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            menuIcon.textContent = 'menu';
            document.body.style.overflow = '';
        }
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // 4. Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');

    // Throttle scroll event for performance
    let isScrolling;
    window.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 100); // 100ms throttle
    }, { passive: true }); // passive listener for scroll performance

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 5. Affiliate Coupon System
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
        return container;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="material-icons-round">check_circle</span> ${message}`;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    }

    const revealWrappers = document.querySelectorAll('.code-reveal-wrapper');
    
    revealWrappers.forEach(wrapper => {
        const btn = wrapper.querySelector('.show-code-btn');
        const mask = wrapper.querySelector('.hidden-code-mask');
        const realCode = wrapper.getAttribute('data-code');
        const affiliateLink = wrapper.getAttribute('data-link');
        
        btn.addEventListener('click', async () => {
            if (!wrapper.classList.contains('revealed')) {
                // 1. Reveal the code
                wrapper.classList.add('revealed');
                mask.textContent = realCode;
                btn.textContent = 'Copied';
                
                // 2. Copy to clipboard
                try {
                    await navigator.clipboard.writeText(realCode);
                    // 4. Show toast notification
                    showToast('Coupon copied! Opening store...');
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    showToast('Code revealed! Opening store...'); // Fallback message
                }

                // 3. Open affiliate link in new tab after a brief delay
                setTimeout(() => {
                    window.open(affiliateLink, '_blank', 'noopener,sponsored');
                }, 800);
                
                // Reset button text after 3 seconds, but keep revealed state
                setTimeout(() => {
                    btn.textContent = 'Copy';
                }, 3000);
            } else {
                // Already revealed, just copy again
                try {
                    await navigator.clipboard.writeText(realCode);
                    btn.textContent = 'Copied';
                    showToast('Coupon copied!');
                    setTimeout(() => {
                        btn.textContent = 'Copy';
                    }, 3000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            }
        });
    });

    // 6. Smooth Reveal Animations via Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, {
            root: null,
            threshold: 0.1, // Trigger when 10% is visible
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('active'));
    }

    // 7. Animated Counters
    const counters = document.querySelectorAll('.counter-number');
    
    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    } else {
        counters.forEach(counter => startCounter(counter));
    }

    function startCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const stepTime = Math.abs(Math.floor(duration / 100)); // ~100 frames
        let current = 0;
        const increment = target / 100;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.innerText = target > 1000 ? (target/1000).toFixed(target>=1000000?1:0) + (target>=1000000?'M+':'k+') : target;
                clearInterval(timer);
            } else {
                counter.innerText = Math.ceil(current);
            }
        }, stepTime);
    }

    // 8. Search Suggestions (Mock functionality)
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    const mockData = [
        "Best VPNs 2024", "Photo Editors for iOS", "Video Editing Software",
        "PC Optimization", "Antivirus Deals", "Trending Android Games"
    ];

    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchSuggestions.innerHTML = '';
            
            if (query.length > 1) {
                const filtered = mockData.filter(item => item.toLowerCase().includes(query));
                
                if (filtered.length > 0) {
                    filtered.forEach(match => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.innerHTML = `<span class="material-icons-round">search</span> ${match}`;
                        div.addEventListener('click', () => {
                            searchInput.value = match;
                            searchSuggestions.classList.remove('active');
                            // Trigger search form submit here if needed
                        });
                        searchSuggestions.appendChild(div);
                    });
                    searchSuggestions.classList.add('active');
                } else {
                    searchSuggestions.classList.remove('active');
                }
            } else {
                searchSuggestions.classList.remove('active');
            }
        });

        // Hide suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.remove('active');
            }
        });
    }

    // 9. Skeleton Loading & Review Injection
    const reviewsGrid = document.getElementById('reviews-grid');
    const reviewDataTemplate = document.getElementById('review-data');
    
    if (reviewsGrid && reviewDataTemplate) {
        // Create 3 skeleton cards
        for(let i=0; i<3; i++) {
            const skeletonHTML = `
                <article class="card skeleton">
                    <div class="card-img-wrapper">
                        <div class="skeleton-img"></div>
                    </div>
                    <div class="card-content">
                        <div class="skeleton-text short"></div>
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short" style="margin-top:auto"></div>
                    </div>
                </article>
            `;
            reviewsGrid.insertAdjacentHTML('beforeend', skeletonHTML);
        }

        // Simulate network request then replace skeletons with actual data
        setTimeout(() => {
            reviewsGrid.innerHTML = '';
            const clone = reviewDataTemplate.content.cloneNode(true);
            reviewsGrid.appendChild(clone);
            initCategoryFilter(); // Initialize filter after items are injected
        }, 1500); // 1.5s delay simulation
    }

    // 10. Category Filter
    function initCategoryFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const reviewCards = document.querySelectorAll('#reviews-grid .review-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button state
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                const filter = btn.getAttribute('data-filter');

                // Filter cards
                reviewCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.classList.remove('hide');
                        // Small animation reset
                        card.style.animation = 'none';
                        card.offsetHeight; /* trigger reflow */
                        card.style.animation = null; 
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });
    }

    // 11. Featured Slider (Vanilla JS)
    const track = document.getElementById('slider-track');
    const prevBtn = document.querySelector('.slider-container .prev-btn');
    const nextBtn = document.querySelector('.slider-container .next-btn');

    if (track && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const slideWidth = track.querySelector('.slide').offsetWidth + 32; // gap
            track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const slideWidth = track.querySelector('.slide').offsetWidth + 32;
            track.scrollBy({ left: slideWidth, behavior: 'smooth' });
        });
    }

    // 12. FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            btn.setAttribute('aria-expanded', !isExpanded);
            btn.nextElementSibling.setAttribute('aria-hidden', isExpanded);
        });
    });

    // 13. Newsletter Form Validation
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const errorMsg = document.getElementById('email-error');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email) {
                showError('Email is required.');
            } else if (!emailRegex.test(email)) {
                showError('Please enter a valid email address.');
            } else {
                // Success
                errorMsg.textContent = '';
                emailInput.classList.remove('error');
                
                const btn = newsletterForm.querySelector('button');
                const originalText = btn.textContent;
                btn.textContent = 'Subscribed!';
                btn.style.backgroundColor = 'var(--secondary-color)';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    emailInput.value = '';
                }, 3000);
            }
        });

        emailInput.addEventListener('input', () => {
            if (emailInput.classList.contains('error')) {
                errorMsg.textContent = '';
                emailInput.classList.remove('error');
            }
        });
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        emailInput.classList.add('error');
        emailInput.focus();
    }

    // 14. Cookie Consent Banner
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    if (cookieBanner) {
        // Show after short delay if not already accepted/declined
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 2000);
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
            // Init GA/GTM here dynamically if needed
        });

        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.remove('show');
        });
    }

    // 15. Lightbox for Review Page
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const triggers = document.querySelectorAll('.lightbox-trigger');

    if (lightbox && lightboxImg && triggers.length > 0) {
        triggers.forEach(img => {
            img.addEventListener('click', () => {
                const src = img.getAttribute('src');
                lightboxImg.setAttribute('src', src);
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
            // Support keyboard navigation
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    img.click();
                }
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            // Clear src after animation to prevent flashing previous image on next open
            setTimeout(() => {
                lightboxImg.setAttribute('src', '');
            }, 300);
        };

        lightboxClose?.addEventListener('click', closeLightbox);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
