class App {
    static async init() {
        const path = window.location.pathname;
        if (path.includes('review') || document.querySelector('.review-title')) {
            await this.initReviewPage();
        } else {
            await this.initHomePage();
        }
        this.initSearch();
    }

    static async initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchForm = document.getElementById('search-form');
        const suggestionsBox = document.getElementById('search-suggestions');
        
        if (!searchInput || !searchForm) return;

        const allReviews = await DataService.getAllReviews();

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                if (suggestionsBox) suggestionsBox.innerHTML = '';
                return;
            }

            const results = allReviews.filter(r => 
                r.title.toLowerCase().includes(query) || 
                r.description.toLowerCase().includes(query) ||
                (r.tags && r.tags.some(t => t.toLowerCase().includes(query)))
            ).slice(0, 5);

            if (suggestionsBox) {
                if (results.length > 0) {
                    suggestionsBox.innerHTML = results.map(r => `
                        <a href="review.html?id=${r.id}" class="suggestion-item">
                            <img src="${r.icon}" alt="${r.title} icon" width="30" height="30">
                            <span>${r.title}</span>
                        </a>
                    `).join('');
                } else {
                    suggestionsBox.innerHTML = '<div class="suggestion-item">No results found</div>';
                }
            }
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.toLowerCase();
            const reviewsGrid = document.getElementById('reviews-grid');
            if (reviewsGrid) {
                const results = allReviews.filter(r => 
                    r.title.toLowerCase().includes(query) || 
                    r.description.toLowerCase().includes(query) ||
                    (r.tags && r.tags.some(t => t.toLowerCase().includes(query)))
                );
                document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
                this.renderReviews(results, reviewsGrid);
                // hide pagination on search
                const paginationContainer = document.getElementById('pagination-container');
                if (paginationContainer) paginationContainer.innerHTML = '';
            }
        });
    }

    static async initHomePage() {
        const allReviews = await DataService.getAllReviews();
        const coupons = await DataService.getCoupons();

        // Populate Trending Slider
        const sliderTrack = document.getElementById('slider-track');
        if (sliderTrack) {
            const trending = allReviews.filter(r => r.isTrending);
            if (trending.length > 0) {
                sliderTrack.innerHTML = trending.map(item => Components.createSlideCard(item)).join('');
            } else {
                sliderTrack.innerHTML = allReviews.slice(0, 3).map(item => Components.createSlideCard(item)).join('');
            }
        }

        // Setup Sorting & Pagination
        const sortSelect = document.getElementById('sort-select');
        let currentSort = 'newest';
        let currentPage = 1;
        const itemsPerPage = 3;

        const sortReviews = (reviews, sortStr) => {
            let sorted = [...reviews];
            if (sortStr === 'rating') {
                sorted.sort((a, b) => b.rating - a.rating);
            } else if (sortStr === 'name') {
                sorted.sort((a, b) => a.title.localeCompare(b.title));
            } else {
                sorted.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
            }
            return sorted;
        };

        const reviewsGrid = document.getElementById('reviews-grid');
        let filteredReviews = [...allReviews];
        let currentFilter = 'all';

        const renderPagination = (totalItems) => {
            let container = document.getElementById('pagination-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'pagination-container';
                container.className = 'pagination-container';
                if (reviewsGrid) reviewsGrid.parentNode.insertBefore(container, reviewsGrid.nextSibling);
            }
            
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} page-btn" data-page="${i}">${i}</button>`;
            }
            container.innerHTML = html;

            container.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentPage = parseInt(e.target.getAttribute('data-page'));
                    updateGrid();
                    document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
                });
            });
        };

        const updateGrid = () => {
            let finalData = sortReviews(filteredReviews, currentSort);
            
            // Pagination
            const start = (currentPage - 1) * itemsPerPage;
            const paginatedData = finalData.slice(start, start + itemsPerPage);
            
            this.renderReviews(paginatedData, reviewsGrid);
            renderPagination(finalData.length);
        };

        if (reviewsGrid) {
            updateGrid();

            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    currentSort = e.target.value;
                    currentPage = 1; // reset to first page
                    updateGrid();
                });
            }

            // Setup filters
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilter = e.target.getAttribute('data-filter');
                    
                    if (currentFilter !== 'all') {
                        filteredReviews = allReviews.filter(r => {
                            if (currentFilter === 'android' && r.categoryId !== 'pc' && !r.categoryId.includes('ios')) return true;
                            if (currentFilter === 'pc' && r.categoryId === 'pc') return true;
                            if (currentFilter === 'ios' && r.categoryId.includes('ios')) return true;
                            return false;
                        });
                    } else {
                        filteredReviews = [...allReviews];
                    }
                    currentPage = 1; // reset page
                    updateGrid();
                });
            });
        }

        // Populate Coupons Grid
        const couponsGrid = document.querySelector('.coupon-grid');
        if (couponsGrid) {
            const topCoupons = coupons.filter(c => c.isTop);
            couponsGrid.innerHTML = topCoupons.map(c => Components.createCouponCard(c)).join('');
            this.attachCouponListeners(couponsGrid);
        }
    }

    static renderReviews(items, container) {
        if(items.length === 0) {
            container.innerHTML = '<p>No items found.</p>';
            return;
        }
        container.innerHTML = items.map(item => Components.createAppCard(item)).join('');
    }

    static attachCouponListeners(container) {
        const revealWrappers = container.querySelectorAll('.code-reveal-wrapper');
        revealWrappers.forEach(wrapper => {
            const btn = wrapper.querySelector('.show-code-btn');
            const mask = wrapper.querySelector('.hidden-code-mask');
            const realCode = wrapper.getAttribute('data-code');
            const affiliateLink = wrapper.getAttribute('data-link');
            
            btn.addEventListener('click', async () => {
                if (!wrapper.classList.contains('revealed')) {
                    wrapper.classList.add('revealed');
                    mask.textContent = realCode;
                    btn.textContent = 'Copied';
                    try {
                        await navigator.clipboard.writeText(realCode);
                    } catch (err) {}
                    setTimeout(() => {
                        window.open(affiliateLink, '_blank', 'noopener,sponsored');
                    }, 800);
                    setTimeout(() => { btn.textContent = 'Copy'; }, 3000);
                } else {
                    try {
                        await navigator.clipboard.writeText(realCode);
                        btn.textContent = 'Copied';
                        setTimeout(() => { btn.textContent = 'Copy'; }, 3000);
                    } catch (err) {}
                }
            });
        });
    }

    
    static async setupAffiliateFeatures(review) {
        
        // -- Affiliate System Injections --
        
        // 1. Affiliate Buttons
        const affiliateContainer = document.getElementById('affiliate-buttons-container');
        if (affiliateContainer && review.affiliateLinks && review.affiliateLinks.length > 0) {
            affiliateContainer.innerHTML = review.affiliateLinks.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener sponsored" class="btn ${link.isPrimary ? 'btn-primary cta-pulse' : 'btn-outline'} affiliate-btn">
                    ${link.icon ? `<span class="material-icons-round">${link.icon}</span>` : ''} ${link.label}
                </a>
            `).join('');
        }

        // 2. Trust Score
        const trustBox = document.getElementById('trust-score-box');
        if (trustBox && review.trustScore) {
            trustBox.innerHTML = `
                <div class="trust-score-header">
                    <span class="material-icons-round text-secondary">verified_user</span>
                    <h3>Trust Score</h3>
                </div>
                <div class="trust-score-value">${review.trustScore}<span class="trust-score-max">/100</span></div>
                <p class="trust-score-desc">Based on expert testing, user reviews, and security audits.</p>
                ${review.communityRating ? `
                <div class="community-rating">
                    <span>Community Rating:</span>
                    <div class="rating">
                        ${Components.getRatingStars(review.communityRating)}
                    </div>
                    <strong>${review.communityRating}</strong>
                </div>` : ''}
            `;
        } else if (trustBox) { trustBox.style.display = 'none'; }

        // 3. Price Comparison
        const priceBox = document.getElementById('price-comparison-box');
        if (priceBox && review.priceComparison && review.priceComparison.length > 0) {
            priceBox.innerHTML = `
                <h3>Best Prices Today</h3>
                <ul class="price-comparison-list">
                    ${review.priceComparison.map(p => `
                        <li class="price-comparison-item ${p.isBest ? 'best-deal-highlight' : ''}">
                            <div class="price-store-info">
                                <span class="store-name">${p.store}</span>
                                ${p.badge ? `<span class="deal-badge">${p.badge}</span>` : ''}
                                ${p.isBest ? `<span class="best-deal-badge">Best Deal</span>` : ''}
                            </div>
                            <div class="price-action">
                                <span class="price-amount">${p.price}</span>
                                <a href="${p.url}" target="_blank" rel="noopener sponsored" class="btn btn-sm ${p.isBest ? 'btn-primary' : 'btn-outline'}">View</a>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (priceBox) { priceBox.style.display = 'none'; }

        // 4. Editor Recommendation
        const editorBox = document.getElementById('editor-recommendation-box');
        if (editorBox && review.editorRecommendation) {
            editorBox.innerHTML = `
                <div class="editor-rec-content">
                    <div class="editor-rec-header">
                        <span class="material-icons-round">thumb_up</span>
                        <h3>Editor's Take</h3>
                    </div>
                    <p>${review.editorRecommendation}</p>
                </div>
            `;
        } else if (editorBox) { editorBox.style.display = 'none'; }

        // 5. Related Guides
        const guidesBox = document.getElementById('related-guides-section');
        if (guidesBox && review.relatedGuides && review.relatedGuides.length > 0) {
            guidesBox.innerHTML = `
                <h2>Related Buying Guides</h2>
                <ul class="related-guides-list">
                    ${review.relatedGuides.map(g => `
                        <li>
                            <a href="${g.url}">
                                <span class="material-icons-round">menu_book</span> ${g.title}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (guidesBox) { guidesBox.style.display = 'none'; }
        
        // 6. Mobile Sticky CTA
        const stickyCta = document.getElementById('sticky-mobile-cta');
        if (stickyCta && review.affiliateLinks) {
            const primaryLink = review.affiliateLinks.find(l => l.isPrimary) || review.affiliateLinks[0];
            if (primaryLink) {
                stickyCta.innerHTML = `
                    <div class="sticky-cta-content">
                        <div class="sticky-cta-info">
                            <strong>${review.title}</strong>
                            <span>${primaryLink.label}</span>
                        </div>
                        <a href="${primaryLink.url}" target="_blank" rel="noopener sponsored" class="btn btn-primary cta-pulse">Get Deal</a>
                    </div>
                `;
                // Show on scroll
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        stickyCta.classList.add('visible');
                    } else {
                        stickyCta.classList.remove('visible');
                    }
                }, {passive: true});
            }
        }

    }

    static async initReviewPage() {
    
        const urlParams = new URLSearchParams(window.location.search);
        let id = urlParams.get('id');
        
        // Support clean URLs like /reviews/capcut-pro
        if (!id && window.location.pathname.includes('/reviews/')) {
            const parts = window.location.pathname.split('/').filter(Boolean);
            id = parts[parts.length - 1]; 
        }

        const review = await DataService.getReviewById(id);
        if (!review) {
            document.querySelector('.main-content').innerHTML = '<h2>Review not found</h2>';
            return;
        }

        document.title = `${review.title} Review | PlayNewApps`;
        
        // Update DOM elements
        const setText = (sel, text) => { const el = document.querySelector(sel); if(el) el.textContent = text; };
        const setHtml = (sel, html) => { const el = document.querySelector(sel); if(el) el.innerHTML = html; };
        const setSrc = (sel, src) => { const el = document.querySelector(sel); if(el) el.src = src; };

        setText('.review-title', `${review.title} Review`);
        setText('.review-subtitle', review.description);
        setSrc('.app-icon', review.icon);
        
        const ratingHtml = Components.getRatingStars(review.rating) + `<span class="rating-text">${review.rating} / 5.0 Overall</span>`;
        setHtml('.review-rating', ratingHtml);

        if (review.updatedAt) {
            setHtml('.update-date', `<span class="material-icons-round">update</span> Updated ${new Date(review.updatedAt).toLocaleDateString('en-US')}`);
        }

        const tbody = document.querySelector('.quick-info-table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><th>Developer</th><td>${review.developer || 'Unknown'}</td></tr>
                <tr><th>Category</th><td>${review.categoryId || 'App'}</td></tr>
                <tr><th>Version</th><td>${review.version || 'Varies'}</td></tr>
                <tr><th>Size</th><td>${review.size || 'Varies'}</td></tr>
                <tr><th>Platforms</th><td>${(review.platforms||[]).join(', ') || 'N/A'}</td></tr>
                <tr><th>License</th><td>${review.license || 'Free / Paid'}</td></tr>
            `;
        }

        const tagsBox = document.querySelector('.tags-box');
        if (tagsBox && review.tags) {
            tagsBox.innerHTML = review.tags.map(t => `<span class="tag">#${t}</span>`).join(' ');
        }

        const leadText = document.querySelector('.lead-text');
        if (leadText && review.summary) {
            leadText.textContent = review.summary;
        }

        const prosList = document.querySelector('.pros-card .feature-list');
        if (prosList && review.pros) {
            prosList.innerHTML = review.pros.map(p => `<li>${p}</li>`).join('');
        }
        const consList = document.querySelector('.cons-card .feature-list');
        if (consList && review.cons) {
            consList.innerHTML = review.cons.map(c => `<li>${c}</li>`).join('');
        }
        
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid && review.screenshots) {
            galleryGrid.innerHTML = review.screenshots.map(s => `
                <picture>
                    <source srcset="${s.thumbnail}" type="image/webp">
                    <img src="${s.url}" alt="${s.alt}" class="gallery-img lightbox-trigger" loading="lazy" width="800" height="600" tabindex="0">
                </picture>
            `).join('');
            
            setTimeout(() => {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                const triggers = document.querySelectorAll('.lightbox-trigger');
                triggers.forEach(img => {
                    img.addEventListener('click', () => {
                        lightboxImg.setAttribute('src', img.getAttribute('src'));
                        lightbox.classList.add('active');
                        lightbox.setAttribute('aria-hidden', 'false');
                        document.body.style.overflow = 'hidden';
                    });
                });
            }, 100);
        }

        const breakdownBox = document.querySelector('.rating-breakdown-box');
        if (breakdownBox && review.ratingBreakdown) {
            const rb = review.ratingBreakdown;
            breakdownBox.innerHTML = Object.keys(rb).map(key => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const score = rb[key];
                const pct = (score / 5) * 100;
                return `
                <div class="rating-bar-row">
                    <span class="rating-label">${label}</span>
                    <div class="progress-bar"><div class="progress-fill ${score >= 4.5 ? 'bg-success' : ''}" style="width: ${pct}%;"></div></div>
                    <span class="rating-score">${score.toFixed(1)}</span>
                </div>`;
            }).join('');
        }

        const dynamicBody = document.getElementById('dynamic-review-body');
        if (dynamicBody && review.contentHtml) {
            dynamicBody.innerHTML = review.contentHtml;
        } else if (dynamicBody) {
            dynamicBody.style.display = 'none';
        }

        this.renderRelatedContent(review);
    }

    static async renderRelatedContent(currentReview) {
        const allReviews = await DataService.getAllReviews();
        let related = allReviews.filter(r => r.id !== currentReview.id && (
            r.categoryId === currentReview.categoryId ||
            (r.tags && currentReview.tags && r.tags.some(t => currentReview.tags.includes(t)))
        ));
        
        if (related.length === 0) {
            related = allReviews.filter(r => r.id !== currentReview.id);
        }

        const relatedGrid = document.getElementById('related-grid');
        if (relatedGrid) {
            this.renderReviews(related.slice(0, 3), relatedGrid);
        }

        // -- Affiliate System Injections --
        
        // 1. Affiliate Buttons
        const affiliateContainer = document.getElementById('affiliate-buttons-container');
        if (affiliateContainer && review.affiliateLinks && review.affiliateLinks.length > 0) {
            affiliateContainer.innerHTML = review.affiliateLinks.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener sponsored" class="btn ${link.isPrimary ? 'btn-primary cta-pulse' : 'btn-outline'} affiliate-btn">
                    ${link.icon ? `<span class="material-icons-round">${link.icon}</span>` : ''} ${link.label}
                </a>
            `).join('');
        }

        // 2. Trust Score
        const trustBox = document.getElementById('trust-score-box');
        if (trustBox && review.trustScore) {
            trustBox.innerHTML = `
                <div class="trust-score-header">
                    <span class="material-icons-round text-secondary">verified_user</span>
                    <h3>Trust Score</h3>
                </div>
                <div class="trust-score-value">${review.trustScore}<span class="trust-score-max">/100</span></div>
                <p class="trust-score-desc">Based on expert testing, user reviews, and security audits.</p>
                ${review.communityRating ? `
                <div class="community-rating">
                    <span>Community Rating:</span>
                    <div class="rating">
                        ${Components.getRatingStars(review.communityRating)}
                    </div>
                    <strong>${review.communityRating}</strong>
                </div>` : ''}
            `;
        } else if (trustBox) { trustBox.style.display = 'none'; }

        // 3. Price Comparison
        const priceBox = document.getElementById('price-comparison-box');
        if (priceBox && review.priceComparison && review.priceComparison.length > 0) {
            priceBox.innerHTML = `
                <h3>Best Prices Today</h3>
                <ul class="price-comparison-list">
                    ${review.priceComparison.map(p => `
                        <li class="price-comparison-item ${p.isBest ? 'best-deal-highlight' : ''}">
                            <div class="price-store-info">
                                <span class="store-name">${p.store}</span>
                                ${p.badge ? `<span class="deal-badge">${p.badge}</span>` : ''}
                                ${p.isBest ? `<span class="best-deal-badge">Best Deal</span>` : ''}
                            </div>
                            <div class="price-action">
                                <span class="price-amount">${p.price}</span>
                                <a href="${p.url}" target="_blank" rel="noopener sponsored" class="btn btn-sm ${p.isBest ? 'btn-primary' : 'btn-outline'}">View</a>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (priceBox) { priceBox.style.display = 'none'; }

        // 4. Editor Recommendation
        const editorBox = document.getElementById('editor-recommendation-box');
        if (editorBox && review.editorRecommendation) {
            editorBox.innerHTML = `
                <div class="editor-rec-content">
                    <div class="editor-rec-header">
                        <span class="material-icons-round">thumb_up</span>
                        <h3>Editor's Take</h3>
                    </div>
                    <p>${review.editorRecommendation}</p>
                </div>
            `;
        } else if (editorBox) { editorBox.style.display = 'none'; }

        // 5. Related Guides
        const guidesBox = document.getElementById('related-guides-section');
        if (guidesBox && review.relatedGuides && review.relatedGuides.length > 0) {
            guidesBox.innerHTML = `
                <h2>Related Buying Guides</h2>
                <ul class="related-guides-list">
                    ${review.relatedGuides.map(g => `
                        <li>
                            <a href="${g.url}">
                                <span class="material-icons-round">menu_book</span> ${g.title}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (guidesBox) { guidesBox.style.display = 'none'; }
        
        // 6. Mobile Sticky CTA
        const stickyCta = document.getElementById('sticky-mobile-cta');
        if (stickyCta && review.affiliateLinks) {
            const primaryLink = review.affiliateLinks.find(l => l.isPrimary) || review.affiliateLinks[0];
            if (primaryLink) {
                stickyCta.innerHTML = `
                    <div class="sticky-cta-content">
                        <div class="sticky-cta-info">
                            <strong>${review.title}</strong>
                            <span>${primaryLink.label}</span>
                        </div>
                        <a href="${primaryLink.url}" target="_blank" rel="noopener sponsored" class="btn btn-primary cta-pulse">Get Deal</a>
                    </div>
                `;
                // Show on scroll
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        stickyCta.classList.add('visible');
                    } else {
                        stickyCta.classList.remove('visible');
                    }
                }, {passive: true});
            }
        }

    }
}

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Add support for new pages
const oldInit = App.init.bind(App);
App.init = async function() {
    const path = window.location.pathname;
    if (path.endsWith('author.html')) {
        await this.initAuthorPage();
    } else if (path.endsWith('category.html')) {
        await this.initCategoryPage();
    } else if (path.endsWith('store.html')) {
        await this.initStorePage();
    } else if (path.endsWith('coupon.html')) {
        await this.initCouponPage();
    } else {
        await oldInit();
        return; // oldInit handles search
    }
    
    await this.setupAffiliateFeatures(review);
    this.initSearch();
};

App.initAuthorPage = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id') || 'alex-tech';
    const authors = await DataService.getAuthors();
    const author = authors.find(a => a.id === id);
    
    document.querySelector('.hero-title').textContent = author ? author.name : 'Author Not Found';
    document.querySelector('.hero-subtitle').textContent = author ? author.role : '';
    
    // Clear sliders and deals
    const slider = document.getElementById('featured');
    if(slider) slider.style.display = 'none';
    const deals = document.getElementById('deals');
    if(deals) deals.style.display = 'none';
    const counters = document.querySelector('.counters-section');
    if(counters) counters.style.display = 'none';

    document.querySelector('#reviews .section-title').textContent = `Reviews by ${author ? author.name : 'Author'}`;
    const allReviews = await DataService.getAllReviews();
    const authorReviews = allReviews.filter(r => r.authorId === id);
    this.renderReviews(authorReviews, document.getElementById('reviews-grid'));
};

App.initCategoryPage = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id') || 'video-editors';
    const categories = await DataService.getCategories();
    const category = categories.find(c => c.id === id);
    
    document.querySelector('.hero-title').textContent = category ? category.name : 'Category Not Found';
    document.querySelector('.hero-subtitle').textContent = 'Browse the best apps in this category.';
    
    const slider = document.getElementById('featured');
    if(slider) slider.style.display = 'none';
    const deals = document.getElementById('deals');
    if(deals) deals.style.display = 'none';
    const counters = document.querySelector('.counters-section');
    if(counters) counters.style.display = 'none';

    document.querySelector('#reviews .section-title').textContent = `Apps in ${category ? category.name : 'Category'}`;
    const allReviews = await DataService.getAllReviews();
    const catReviews = allReviews.filter(r => r.categoryId === id);
    this.renderReviews(catReviews, document.getElementById('reviews-grid'));
};

App.initStorePage = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id') || 'nordvpn';
    
    const stores = await DataService.getStores();
    const store = stores ? stores.find(s => s.id === id) : null;
    
    if (!store) {
        document.querySelector('.main-content').innerHTML = '<h2>Store not found</h2>';
        return;
    }

    document.title = `${store.name} Promo Codes & Deals | PlayNewApps`;
    
    // Header Info
    document.getElementById('breadcrumb-store').textContent = store.name;
    document.getElementById('store-name').textContent = `${store.name} Coupons & Promo Codes`;
    document.getElementById('store-logo').src = store.logo;
    document.getElementById('store-logo').alt = `${store.name} Logo`;
    document.getElementById('store-about').textContent = store.about || `Discover the latest deals for ${store.name}.`;
    document.getElementById('store-cta').href = '/coupon.html'; // In a real app this would be an affiliate link
    document.getElementById('store-cta').textContent = `Shop at ${store.name}`;

    // Rating
    document.getElementById('store-rating-box').innerHTML = `
        <div class="rating" aria-label="Store Rating ${store.rating}">
            ${Components.getRatingStars(store.rating)}
        </div>
        <span class="votes-count">(${store.votes || 0} votes)</span>
    `;

    // Coupons
    const allCoupons = await DataService.getCoupons();
    const storeCoupons = allCoupons.filter(c => c.store.id === id || c.store.name.toLowerCase().includes(id));
    
    const activeCoupons = storeCoupons.filter(c => c.status !== 'expired');
    const expiredCoupons = storeCoupons.filter(c => c.status === 'expired');

    const activeGrid = document.getElementById('active-coupons-grid');
    if (activeGrid) {
        if (activeCoupons.length > 0) {
            activeGrid.innerHTML = activeCoupons.map(c => Components.createCouponCard(c)).join('');
            this.attachCouponListeners(activeGrid);
        } else {
            activeGrid.innerHTML = '<p>No active coupons found at the moment.</p>';
        }
    }

    const expiredGrid = document.getElementById('expired-coupons-grid');
    const expiredSection = document.getElementById('expired-coupons');
    if (expiredGrid && expiredSection) {
        if (expiredCoupons.length > 0) {
            expiredGrid.innerHTML = expiredCoupons.map(c => Components.createCouponCard(c)).join('');
            this.attachCouponListeners(expiredGrid);
        } else {
            expiredSection.style.display = 'none';
        }
    }

    // FAQs
    const faqContainer = document.getElementById('faq-container');
    const faqSection = document.getElementById('store-faq');
    if (faqContainer && faqSection) {
        if (store.faqs && store.faqs.length > 0) {
            faqContainer.innerHTML = store.faqs.map(faq => `
                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        ${faq.question}
                        <span class="material-icons-round" aria-hidden="true">expand_more</span>
                    </button>
                    <div class="faq-answer" aria-hidden="true">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `).join('');
            
            // Re-initialize FAQ toggles
            const faqQuestions = document.querySelectorAll('.faq-question');
            faqQuestions.forEach(btn => {
                btn.addEventListener('click', () => {
                    const expanded = btn.getAttribute('aria-expanded') === 'true' || false;
                    btn.setAttribute('aria-expanded', !expanded);
                    const answer = btn.nextElementSibling;
                    if (!expanded) {
                        answer.setAttribute('aria-hidden', 'false');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    } else {
                        answer.setAttribute('aria-hidden', 'true');
                        answer.style.maxHeight = null;
                    }
                });
            });
        } else {
            faqSection.style.display = 'none';
        }
    }

    // Popular Coupons (Sidebar)
    const popularList = document.getElementById('popular-coupons-list');
    if (popularList) {
        const popularCoupons = activeCoupons.filter(c => c.isTop).slice(0, 5);
        if (popularCoupons.length > 0) {
            popularList.innerHTML = popularCoupons.map(c => `
                <div class="popular-coupon-item">
                    <div class="popular-coupon-title">${c.title}</div>
                    <div class="popular-coupon-meta">${c.discount} - ${c.successRate} Success</div>
                </div>
            `).join('');
        } else {
            popularList.innerHTML = '<p>No popular coupons available.</p>';
        }
    }

    // Related Stores
    const relatedList = document.getElementById('related-stores-list');
    if (relatedList) {
        if (store.related && store.related.length > 0) {
            const relatedStores = stores.filter(s => store.related.includes(s.id));
            relatedList.innerHTML = relatedStores.map(s => `
                <a href="store.html?id=${s.id}" class="related-store-item">
                    <img src="${s.logo}" alt="${s.name}" class="related-store-icon" width="40" height="40">
                    <span>${s.name}</span>
                </a>
            `).join('');
        } else {
            relatedList.innerHTML = '<p>No related stores.</p>';
        }
    }

    // JSON-LD Schema (Store & FAQ)
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Store",
                "name": store.name,
                "image": store.logo,
                "description": store.about
            }
        ]
    };
    if (store.faqs && store.faqs.length > 0) {
        schemaData["@graph"].push({
            "@type": "FAQPage",
            "mainEntity": store.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        });
    }
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
};

App.initCouponPage = async function() {
    document.querySelector('.hero-title').textContent = 'All Coupons & Deals';
    document.querySelector('.hero-subtitle').textContent = 'Save money on the best software.';
    
    const slider = document.getElementById('featured');
    if(slider) slider.style.display = 'none';
    const counters = document.querySelector('.counters-section');
    if(counters) counters.style.display = 'none';
    const reviews = document.getElementById('reviews');
    if(reviews) reviews.style.display = 'none';

    const allCoupons = await DataService.getCoupons();
    const couponsGrid = document.querySelector('.coupon-grid');
    if (couponsGrid) {
        couponsGrid.innerHTML = allCoupons.map(c => Components.createCouponCard(c)).join('');
        this.attachCouponListeners(couponsGrid);
    }
};
