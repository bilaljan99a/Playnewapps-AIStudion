# Content Management Workflow

This static website is entirely data-driven via client-side JavaScript. This means you do not need to modify any HTML files or build tools to add new reviews, coupons, or update existing content.

All content is managed through simple JSON files located in the `data/` directory.

## Automatically Generated Pages

Because the site fetches data from JSON files, the following pages and sections are populated automatically when you add new content:

- **Latest Reviews / Featured Sections:** New apps with `isFeatured` or `isTrending` will automatically show up on the homepage.
- **Related Reviews:** Driven by shared tags or category associations.
- **Store Pages:** Automatically populated with the store's respective coupons by matching store IDs.
- **Category Pages:** Automatically populated by filtering apps based on their `categoryId`.
- **Search Results:** The search bar filters through all combined JSON data automatically.

---

## 1. How to Add a New App Review

To add a new app, game, or software review, you simply need to add a new JSON object to one of the following files based on its type:
- `data/apps.json` (Mobile apps)
- `data/games.json` (Games)
- `data/software.json` (Desktop software)

### Step-by-Step

1. Open `data/apps.json` (or games/software).
2. Add a new object to the JSON array.
3. Use the following template:

```json
{
    "id": "unique-app-id-slug",
    "title": "App Title",
    "description": "Short excerpt for the card.",
    "icon": "https://url-to-app-icon.png",
    "rating": 4.5,
    "categoryId": "productivity",
    "developer": "Developer Name",
    "version": "1.0.0",
    "size": "50 MB",
    "platforms": ["iOS", "Android"],
    "license": "Free with In-App Purchases",
    "updatedAt": "2024-05-15",
    "badges": ["Editor's Choice"],
    "isFeatured": true,
    "isTrending": false,
    "summary": "Full review text goes here.",
    "pros": [
        "Great interface",
        "Fast performance"
    ],
    "cons": [
        "Requires account"
    ],
    "ratingBreakdown": {
        "easeOfUse": 4.5, "features": 4.0, "design": 5.0, "performance": 4.5, "value": 4.5
    },
    "downloads": [
        { "storeId": "apple", "url": "https://apple.com/..." },
        { "storeId": "google", "url": "https://play.google.com/..." }
    ],
    "screenshots": [
        { "url": "https://url.com/img1.jpg", "thumbnail": "https://url.com/thumb1.jpg", "alt": "Screenshot 1" }
    ],
    "tags": ["productivity", "tools"],
    "affiliateLinks": [
        { "label": "Best Price", "url": "https://example.com/affiliate", "isPrimary": true, "icon": "shopping_cart" }
    ],
    "trustScore": 95,
    "communityRating": 4.8,
    "editorRecommendation": "Highly recommended for all users."
}
```

Once saved, the app will instantly be available via `review.html?id=unique-app-id-slug` and will appear in the respective category pages and search results.

---

## 2. How to Add a New Coupon

Coupons are managed entirely in `data/coupons.json`. When you add a coupon here, it will appear on the Coupons page (`coupons.html`) and on its respective Store page (`store.html?id=store-id`).

### Step-by-Step

1. Open `data/coupons.json`.
2. Add a new object to the array.
3. Use the following template:

```json
{
    "id": "unique-coupon-id",
    "title": "50% Off Annual Plan",
    "description": "Get half off when you subscribe to the annual plan.",
    "store": {
        "id": "store-id-slug",
        "name": "Store Name",
        "logo": "https://url-to-store-logo.png"
    },
    "discount": "50% OFF",
    "badges": ["Verified", "Exclusive"],
    "successRate": "98%",
    "successPercentage": 98,
    "votesCount": 450,
    "expiry": "Ends in 5 days",
    "code": "SAVE50",
    "affiliateLink": "https://example.com/coupon-link",
    "isTop": true,
    "status": "active"
}
```

### Notes on Coupons:
- If a coupon does NOT have a code (e.g., a direct link deal), simply omit the `"code"` property or set it to `null`. The UI will automatically render a "Get Deal" button instead of a "Show Code" button.
- The `"store.id"` must match the id of the store in `data/stores.json` for it to show up correctly on the dedicated store page.
- Set `"status": "expired"` to move the coupon to the expired section of the store.

