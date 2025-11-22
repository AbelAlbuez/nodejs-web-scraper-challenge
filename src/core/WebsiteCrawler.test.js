const WebsiteCrawler = require('./WebsiteCrawler');

describe('WebsiteCrawler', () => {
  let crawler;

  beforeEach(() => {
    crawler = new WebsiteCrawler();
  });

  afterEach(async () => {
    if (crawler.browser) {
      await crawler.closeBrowser();
    }
  });

  describe('Constructor', () => {
    test('should initialize with null browser and page', () => {
      expect(crawler.browser).toBeNull();
      expect(crawler.page).toBeNull();
    });

    test('isReady should return false initially', () => {
      expect(crawler.isReady()).toBe(false);
    });
  });

  describe('openBrowser', () => {
    test('should open browser successfully', async () => {
      await crawler.openBrowser();
      
      expect(crawler.browser).not.toBeNull();
      expect(crawler.page).not.toBeNull();
      expect(crawler.isReady()).toBe(true);
    }, 30000);

    test('should set user agent', async () => {
      await crawler.openBrowser();
      
      const userAgent = await crawler.page.evaluate(() => navigator.userAgent);
      expect(userAgent).toContain('Mozilla');
    }, 30000);
  });

  describe('goToPage', () => {
    test('should throw error if browser is not open', async () => {
      await expect(
        crawler.goToPage('http://example.com')
      ).rejects.toThrow('Browser is not open');
    });

    test('should navigate to valid URL', async () => {
      await crawler.openBrowser();
      await crawler.goToPage('http://example.com');
      
      const url = crawler.page.url();
      expect(url).toContain('example.com');
    }, 30000);

    test('should throw error for invalid URL', async () => {
      await crawler.openBrowser();
      
      await expect(
        crawler.goToPage('invalid-url')
      ).rejects.toThrow();
    }, 30000);
  });

  describe('closeBrowser', () => {
    test('should close browser successfully', async () => {
      await crawler.openBrowser();
      await crawler.closeBrowser();
      
      expect(crawler.browser).toBeNull();
      expect(crawler.page).toBeNull();
    }, 30000);

    test('should handle closing when browser not open', async () => {
      await expect(crawler.closeBrowser()).resolves.not.toThrow();
    });
  });

  describe('Helper Methods', () => {
    beforeEach(async () => {
      await crawler.openBrowser();
      await crawler.goToPage('http://example.com');
    }, 30000);

    test('extractText should get text from element', async () => {
      const text = await crawler.extractText('h1');
      expect(typeof text).toBe('string');
    }, 30000);

    test('extractText should return null for non-existent selector', async () => {
      const text = await crawler.extractText('.non-existent-class-12345');
      expect(text).toBeNull();
    }, 30000);

    test('extractTextFromAll should get text from multiple elements', async () => {
      const texts = await crawler.extractTextFromAll('p');
      expect(Array.isArray(texts)).toBe(true);
    }, 30000);
  });
});