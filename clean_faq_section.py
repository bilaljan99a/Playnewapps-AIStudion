import re

with open('review.html', 'r') as f:
    html = f.read()

html = re.sub(r'<!-- 14\. Frequently Asked Questions -->.*?</section>\s*<!-- 18\. Comments Section Layout -->', '<!-- 18. Comments Section Layout -->', html, flags=re.DOTALL)

with open('review.html', 'w') as f:
    f.write(html)
