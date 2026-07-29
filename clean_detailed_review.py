import re

with open('review.html', 'r') as f:
    html = f.read()

html = re.sub(r'<!-- 7\. Features Section.*?</section>\s*<!-- 11\. Rating Breakdown -->', '<!-- 11. Rating Breakdown -->', html, flags=re.DOTALL)

with open('review.html', 'w') as f:
    f.write(html)
