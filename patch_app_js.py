import re

with open('assets/js/app.js', 'r') as f:
    js = f.read()

patch = """
        document.title = `${review.title} Review | PlayNewApps`;
        
        // --- SEO & Metadata Updates ---
        const canonicalUrl = `https://playnewapps.store/review.html?id=${review.id}`;
        
        const updateMeta = (selector, attr, content) => {
            const el = document.querySelector(selector);
            if (el) el.setAttribute(attr, content);
        };

        updateMeta('meta[name="description"]', 'content', review.description);
        updateMeta('#canonical-url', 'href', canonicalUrl);
        updateMeta('#og-title', 'content', `${review.title} Review | PlayNewApps`);
        updateMeta('#og-description', 'content', review.description);
        updateMeta('#og-url', 'content', canonicalUrl);
        updateMeta('#og-image', 'content', `https://playnewapps.store${review.icon}`);
        updateMeta('#twitter-title', 'content', `${review.title} Review (2024)`);
        updateMeta('#twitter-description', 'content', review.description);
        updateMeta('#twitter-image', 'content', `https://playnewapps.store${review.icon}`);
        
        // --- Schema JSON-LD Injection ---
        const schemaReview = {
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": {
                "@type": "SoftwareApplication",
                "name": review.title,
                "applicationCategory": review.categoryId || "MultimediaApplication",
                "image": `https://playnewapps.store${review.icon}`
            },
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating.toString(),
                "bestRating": "5"
            },
            "author": {
                "@type": "Person",
                "name": review.developer || "PlayNewApps Expert"
            }
        };
        const scriptSchema = document.createElement('script');
        scriptSchema.type = 'application/ld+json';
        scriptSchema.text = JSON.stringify(schemaReview);
        document.head.appendChild(scriptSchema);
        
        // Update Breadcrumb
        const breadcrumbEl = document.getElementById('breadcrumb-current');
        if (breadcrumbEl) breadcrumbEl.textContent = review.title;
"""

js = js.replace("document.title = `${review.title} Review | PlayNewApps`;", patch)

hide_skeleton = """
        // Hide skeleton and show content
        const skeleton = document.getElementById('review-loading-skeleton');
        const article = document.getElementById('review-article');
        if (skeleton) skeleton.style.display = 'none';
        if (article) article.style.display = 'block';

        this.renderRelatedContent(review);
"""

js = js.replace("this.renderRelatedContent(review);", hide_skeleton)

with open('assets/js/app.js', 'w') as f:
    f.write(js)
