class DataService {
    static async fetchJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    static async getApps() { return await this.fetchJSON('/data/apps.json') || []; }
    static async getGames() { return await this.fetchJSON('/data/games.json') || []; }
    static async getSoftware() { return await this.fetchJSON('/data/software.json') || []; }
    static async getCoupons() { return await this.fetchJSON('/data/coupons.json') || []; }
    static async getStores() { return await this.fetchJSON("/data/stores.json") || []; }
    static async getCategories() { return await this.fetchJSON('/data/categories.json') || []; }
    static async getAuthors() { return await this.fetchJSON('/data/authors.json') || []; }
    
    static async getAllReviews() {
        const apps = await this.getApps();
        const games = await this.getGames();
        const software = await this.getSoftware();
        return [...apps, ...games, ...software];
    }

    static async getReviewById(id) {
        const all = await this.getAllReviews();
        return all.find(item => item.id === id);
    }
}
window.DataService = DataService;
