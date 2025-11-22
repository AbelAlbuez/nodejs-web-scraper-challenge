const WebsiteAScraper = require('./WebsiteAScraper');

describe('WebsiteAScraper', () => {
  let scraper;

  beforeEach(() => {
    scraper = new WebsiteAScraper();
  });

  afterEach(async () => {
    if (scraper.browser) {
      await scraper.closeBrowser();
    }
  });

  describe('Constructor', () => {
    test('should initialize with baseUrl', () => {
      expect(scraper.baseUrl).toBe('https://books.toscrape.com/');
    });

    test('should extend WebsiteCrawler', () => {
      expect(scraper.browser).toBeNull();
      expect(scraper.page).toBeNull();
    });
  });

  describe('scrape', () => {
    test('should scrape page and return data with title and products', async () => {
      const data = await scraper.scrape();

      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('products');
      expect(data).toHaveProperty('scrapedAt');
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
    }, 60000);

    test('should return products with name and price', async () => {
      const data = await scraper.scrape();

      expect(data.products[0]).toHaveProperty('name');
      expect(data.products[0]).toHaveProperty('price');
      expect(typeof data.products[0].name).toBe('string');
      expect(typeof data.products[0].price).toBe('string');
    }, 60000);

    test('should close browser after scraping', async () => {
      await scraper.scrape();
      expect(scraper.browser).toBeNull();
      expect(scraper.page).toBeNull();
    }, 60000);
  });

  describe('extractPageData', () => {
    beforeEach(async () => {
      await scraper.openBrowser();
      await scraper.goToPage(scraper.baseUrl);
    }, 60000);

    test('should extract page title', async () => {
      const data = await scraper.extractPageData();
      expect(data.title).toBeTruthy();
      expect(typeof data.title).toBe('string');
    }, 60000);

    test('should extract products array', async () => {
      const data = await scraper.extractPageData();
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
    }, 60000);

    test('should throw error if no products found', async () => {
      await scraper.goToPage('https://books.toscrape.com/catalogue/page-999.html');
      
      await expect(scraper.extractPageData()).rejects.toThrow('Failed to parse product list');
    }, 60000);

    test('should include scrapedAt timestamp', async () => {
      const data = await scraper.extractPageData();
      expect(data.scrapedAt).toBeTruthy();
      expect(new Date(data.scrapedAt).getTime()).toBeGreaterThan(0);
    }, 60000);
  });

  describe('scrapeMultiplePages', () => {
    test('should scrape single page when numPages is 1', async () => {
      const data = await scraper.scrapeMultiplePages(1);

      expect(data).toHaveProperty('products');
      expect(data).toHaveProperty('totalPages');
      expect(data.totalPages).toBe(1);
      expect(data.products.length).toBeGreaterThan(0);
    }, 60000);

    test('should scrape multiple pages', async () => {
      const data = await scraper.scrapeMultiplePages(2);

      expect(data.totalPages).toBe(2);
      expect(data.products.length).toBeGreaterThan(0);
      expect(data.title).toBe('Books to Scrape - Multiple Pages');
    }, 90000);

    test('should close browser after scraping', async () => {
      await scraper.scrapeMultiplePages(1);
      expect(scraper.browser).toBeNull();
      expect(scraper.page).toBeNull();
    }, 60000);
  });

  describe('goToNextPage', () => {
    beforeEach(async () => {
      await scraper.openBrowser();
      await scraper.goToPage(scraper.baseUrl);
    }, 60000);

    test('should navigate to next page if available', async () => {
      const initialUrl = scraper.page.url();
      const hasNext = await scraper.goToNextPage();
      
      expect(hasNext).toBe(true);
      expect(scraper.page.url()).not.toBe(initialUrl);
    }, 60000);

    test('should return false when no next page', async () => {
      // Navigate to last page (assuming page 50 is near the end)
      await scraper.goToPage('https://books.toscrape.com/catalogue/page-50.html');
      
      // Try to go to next page multiple times until we reach the end
      let hasNext = true;
      let attempts = 0;
      while (hasNext && attempts < 5) {
        hasNext = await scraper.goToNextPage();
        attempts++;
      }
      
      // Eventually should return false
      expect(hasNext).toBe(false);
    }, 120000);
  });
});

