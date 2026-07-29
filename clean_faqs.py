import re

with open('review.html', 'r') as f:
    html = f.read()

# Clear FAQ Container
html = re.sub(r'<div class="faq-container">.*?</div>\s*</section>', '<div class="faq-container" id="faq-container"></div></section>', html, flags=re.DOTALL)

# Clear coupon action affiliate box hardcoded links
html = re.sub(r'<div class="code-reveal-wrapper"[^>]*>', '<div class="code-reveal-wrapper" id="affiliate-code-wrapper" style="display:none;">', html, flags=re.DOTALL)
html = re.sub(r'<h4>Exclusive Publisher Deal</h4>\s*<p>Get 20% off all official LUT packs and add-ons using our exclusive code <strong>PLAYNEW20</strong>.</p>', '<h4 id="affiliate-box-title"></h4><p id="affiliate-box-desc"></p>', html, flags=re.DOTALL)
html = re.sub(r'<span class="hidden-code-mask">PLAYN••••</span>', '<span class="hidden-code-mask" id="affiliate-box-mask"></span>', html, flags=re.DOTALL)


# Sidebar Related Articles - remove the specific LumaFusion hardcode and just leave the category ones
html = re.sub(r'<li>\s*<a href="/review.html\?id=capcut-pro">LumaFusion vs CapCut: Which is better\?</a>\s*</li>', '', html, flags=re.DOTALL)

with open('review.html', 'w') as f:
    f.write(html)
