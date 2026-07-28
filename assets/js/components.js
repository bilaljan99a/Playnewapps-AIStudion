class Components {
    static getRatingStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                html += `<span class="material-icons-round star active" aria-hidden="true">star</span>`;
            } else if (rating >= i - 0.5) {
                html += `<span class="material-icons-round star half" aria-hidden="true">star_half</span>`;
            } else {
                html += `<span class="material-icons-round star" aria-hidden="true">star_border</span>`;
            }
        }
        return html;
    }

    static getPlatformIcon(platform) {
        const p = platform ? platform.toLowerCase() : '';
        if (p.includes('ios') || p.includes('apple')) return 'apple';
        if (p.includes('android')) return 'android';
        if (p.includes('pc') || p.includes('windows')) return 'computer';
        return 'apps';
    }

    static createAppCard(item) {
        const platform = (item.platforms && item.platforms.length > 0) ? item.platforms[0] : (item.categoryId === 'pc' ? 'PC' : (item.categoryId === 'action' || item.categoryId === 'rpg' ? 'Games' : 'Android'));
        const icon = this.getPlatformIcon(platform);
        
        return `
            <article class="card review-card" data-category="${item.categoryId}">
                <div class="card-img-wrapper">
                    <img src="${item.icon}" alt="${item.title}" class="card-img" width="600" height="400" loading="lazy">
                    <span class="badge platform-badge"><span class="material-icons-round">${icon}</span> ${platform}</span>
                </div>
                <div class="card-content">
                    <div class="rating" aria-label="Rating ${item.rating} out of 5 stars">
                        ${this.getRatingStars(item.rating)}
                        <span class="rating-text">${item.rating}</span>
                    </div>
                    <h3 class="card-title"><a href="review.html?id=${item.id}">${item.title}</a></h3>
                    <p class="card-excerpt">${item.description}</p>
                    <div class="card-footer">
                        <span class="author">By ${item.authorId ? 'PlayNewApps' : 'Reviewer'}</span>
                        ${item.updatedAt ? `<span class="date"><time datetime="${item.updatedAt}">${new Date(item.updatedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</time></span>` : ''}
                    </div>
                </div>
            </article>
        `;
    }

    static createSlideCard(item) {
        const platform = (item.platforms && item.platforms.length > 0) ? item.platforms[0] : 'App';
        const icon = this.getPlatformIcon(platform);
        return `
            <article class="slide card review-card" role="group" aria-roledescription="slide">
                <div class="card-img-wrapper">
                    <img src="${item.icon}" alt="${item.title}" class="card-img" width="600" height="400" loading="lazy">
                    <span class="badge platform-badge"><span class="material-icons-round">${icon}</span> ${platform}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title"><a href="review.html?id=${item.id}">${item.title}</a></h3>
                    <p class="card-excerpt">${item.description}</p>
                </div>
            </article>
        `;
    }

    static createCouponCard(item) {
        const badgesHtml = (item.badges || []).map(b => {
            const isVerified = b.toLowerCase() === 'verified';
            const bLower = b.toLowerCase();
            let badgeClass = 'exclusive-badge';
            if (bLower.includes('verified')) badgeClass = 'verified-badge';
            if (bLower.includes('exclusive')) badgeClass = 'editor-choice';
            if (bLower.includes('limited')) badgeClass = 'expired-badge'; // Reusing some CSS or add new

            let icon = '';
            if (bLower.includes('verified')) icon = 'verified';
            else if (bLower.includes('exclusive')) icon = 'stars';
            else if (bLower.includes('limited')) icon = 'timer';

            return `<span class="badge ${badgeClass}">${icon ? `<span class="material-icons-round" aria-hidden="true">${icon}</span> ` : ''}${b}</span>`;
        }).join('');

        let actionHtml = '';
        if (item.code) {
            const masked = item.code.substring(0, 4) + '••••';
            actionHtml = `
                <div class="code-reveal-wrapper" data-code="${item.code}" data-link="${item.affiliateLink || '#'}">
                    <span class="hidden-code-mask">${masked}</span>
                    <button class="btn show-code-btn" aria-label="Show Coupon Code and Copy">Show Code</button>
                </div>`;
        } else {
            actionHtml = `<a href="${item.affiliateLink || '#'}" target="_blank" rel="noopener sponsored" class="btn btn-primary full-width get-deal-btn ${item.isTop ? 'cta-pulse' : ''}">Get Deal</a>`;
        }
        
        const successRate = item.successPercentage ? `${item.successPercentage}%` : item.successRate;
        const votes = item.votesCount ? `(${item.votesCount} votes)` : '';

        return `
            <article class="card coupon-card affiliate-card ${item.status === 'expired' ? 'opacity-60' : ''}">
                <div class="coupon-badges">${badgesHtml}</div>
                <div class="coupon-header">
                    <div class="store-info">
                        <img src="${item.store.logo}" alt="${item.store.name} Logo" class="store-logo" width="50" height="50" loading="lazy">
                        <div>
                            <div class="discount" aria-label="${item.discount}">${item.discount}</div>
                            <div class="store-name">${item.store.name}</div>
                        </div>
                    </div>
                </div>
                <div class="coupon-content">
                    <h3 class="coupon-title">${item.title}</h3>
                    <p class="coupon-desc">${item.description}</p>
                    <div class="coupon-meta" style="flex-wrap: wrap;">
                        <span class="success-rate" title="Success Rate"><span class="material-icons-round" aria-hidden="true">thumb_up</span> ${successRate} ${votes}</span>
                        <span class="expiry-date"><span class="material-icons-round" aria-hidden="true">timer</span> ${item.expiry}</span>
                    </div>
                    <div class="coupon-action">${actionHtml}</div>
                </div>
            </article>
        `;
    }
}
window.Components = Components;
