import re

with open('review.html', 'r') as f:
    html = f.read()

# 1. Title
html = re.sub(r'<title>.*?</title>', '<title>Loading Review... | PlayNewApps</title>', html)

# 2. Meta description
html = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Loading review...">', html)

# 3. Canonical and OG tags
html = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="" id="canonical-url">', html)
html = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="" id="og-title">', html)
html = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="" id="og-description">', html)
html = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="" id="og-url">', html)
html = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="" id="og-image">', html)
html = re.sub(r'<meta name="twitter:title" content="[^"]*">', '<meta name="twitter:title" content="" id="twitter-title">', html)
html = re.sub(r'<meta name="twitter:description" content="[^"]*">', '<meta name="twitter:description" content="" id="twitter-description">', html)
html = re.sub(r'<meta name="twitter:image" content="[^"]*">', '<meta name="twitter:image" content="" id="twitter-image">', html)

# 4. JSON-LD Scripts - clear them, we will inject from JS
html = re.sub(r'<script type="application/ld\+json">.*?</script>', '', html, flags=re.DOTALL)

# 5. Breadcrumb - remove hardcoded LumaFusion
html = re.sub(r'<li aria-current="page">[^<]*</li>', '<li aria-current="page" id="breadcrumb-current">...</li>', html)

# Add a loading skeleton before the article
loading_html = """
            <div id="review-loading-skeleton" class="skeleton-container" style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; width: 100%;">
                <div class="skeleton" style="width: 120px; height: 120px; border-radius: 20px;"></div>
                <div class="skeleton" style="width: 60%; height: 40px; margin-top: 1rem;"></div>
                <div class="skeleton" style="width: 80%; height: 20px;"></div>
                <div class="skeleton" style="width: 40%; height: 20px;"></div>
                <div class="skeleton" style="width: 100%; height: 200px; margin-top: 2rem;"></div>
            </div>
            <article class="review-article reveal" id="review-article" style="display: none;">
"""

html = re.sub(r'<article class="review-article reveal active">', loading_html, html)

# 6. Hero Details
html = re.sub(r'<img src="/assets/images/apps/lumafusion.svg"[^>]*>', '<img src="" alt="App Icon" class="app-icon" width="120" height="120">', html)
html = re.sub(r'<h1 class="review-title">.*?</h1>', '<h1 class="review-title"></h1>', html)
html = re.sub(r'<p class="review-subtitle">.*?</p>', '<p class="review-subtitle"></p>', html)

html = re.sub(r'<div class="rating review-rating" aria-label="[^"]*">.*?</div>', '<div class="rating review-rating"></div>', html, flags=re.DOTALL)
html = re.sub(r'<span class="update-date">.*?</span>', '<span class="update-date"></span>', html, flags=re.DOTALL)

# 7. Review Summary & Affiliate box
html = re.sub(r'<div class="inline-cta-box">.*?</div>\s*</div>', '<div class="inline-cta-box" style="display:none;"></div>', html, flags=re.DOTALL)
html = re.sub(r'<div class="affiliate-box card">.*?</div>\s*</div>', '<div class="affiliate-box card" id="affiliate-box" style="display:none;"></div>', html, flags=re.DOTALL)

# 8. Quick Info Table
quick_info = r'<table class="quick-info-table">\s*<tbody>.*?</tbody>\s*</table>'
html = re.sub(quick_info, '<table class="quick-info-table"><tbody></tbody></table>', html, flags=re.DOTALL)

# 9. Screenshots Gallery
gallery = r'<div class="gallery-grid">.*?</div>'
html = re.sub(gallery, '<div class="gallery-grid"></div>', html, flags=re.DOTALL)

# 10. Video Review Section
html = re.sub(r'<div class="video-container">.*?</div>\s*</section>', '<div class="video-container"></div></section>', html, flags=re.DOTALL)

# 11. Pros and Cons
html = re.sub(r'<ul class="feature-list">\s*<li>.*?</li>\s*</ul>', '<ul class="feature-list"></ul>', html, flags=re.DOTALL)

# 12. System Requirements
html = re.sub(r'<table class="specs-table">\s*<tbody>.*?</tbody>\s*</table>', '<table class="specs-table"><tbody></tbody></table>', html, flags=re.DOTALL)

# 13. Rating Breakdown
html = re.sub(r'<div class="rating-breakdown-box">.*?</div>\s*</div>', '<div class="rating-breakdown-box"></div></div>', html, flags=re.DOTALL)

# 14. Clear comments (optional, but they are hardcoded LumaFusion comments)
html = re.sub(r'<div class="comments-list">.*?</div>\s*</section>', '<div class="comments-list"></div></section>', html, flags=re.DOTALL)

with open('review.html', 'w') as f:
    f.write(html)
