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

  test('initializes with null browser and page', () => {
    expect(crawler.browser).toBeNull();
    expect(crawler.page).toBeNull();
  });

  test('isReady returns false initially', () => {
    expect(crawler.isReady()).toBe(false);
  });

  test('opens browser successfully', async () => {
    await crawler.openBrowser();
    
    expect(crawler.browser).not.toBeNull();
    expect(crawler.page).not.toBeNull();
    expect(crawler.isReady()).toBe(true);
  }, 30000);

  test('sets user agent', async () => {
    await crawler.openBrowser();
    
    const userAgent = await crawler.page.evaluate(() => navigator.userAgent);
    expect(userAgent).toContain('Mozilla');
  }, 30000);

  test('throws error if browser is not open', async () => {
    await expect(
      crawler.goToPage('http://example.com')
    ).rejects.toThrow('Browser not initialized');
  });

  test('navigates to valid URL', async () => {
    await crawler.openBrowser();
    await crawler.goToPage('http://example.com');
    
    const url = crawler.page.url();
    expect(url).toContain('example.com');
  }, 30000);

  test('throws error for invalid URL', async () => {
    await crawler.openBrowser();
    
    await expect(
      crawler.goToPage('invalid-url')
    ).rejects.toThrow();
  }, 30000);

  test('closes browser successfully', async () => {
    await crawler.openBrowser();
    await crawler.closeBrowser();
    
    expect(crawler.browser).toBeNull();
    expect(crawler.page).toBeNull();
  }, 30000);

  test('handles closing when browser not open', async () => {
    await expect(crawler.closeBrowser()).resolves.not.toThrow();
  });

  test('extractText gets text from element', async () => {
    await crawler.openBrowser();
    await crawler.goToPage('http://example.com');
    
    const text = await crawler.extractText('h1');
    expect(typeof text).toBe('string');
  }, 30000);

  test('extractText returns null for non-existent selector', async () => {
    await crawler.openBrowser();
    await crawler.goToPage('http://example.com');
    
    const text = await crawler.extractText('.non-existent-class-12345');
    expect(text).toBeNull();
  }, 30000);

  test('extractTextFromAll gets text from multiple elements', async () => {
    await crawler.openBrowser();
    await crawler.goToPage('http://example.com');
    
    const texts = await crawler.extractTextFromAll('p');
    expect(Array.isArray(texts)).toBe(true);
  }, 30000);

  test.skip('should handle rate limiting', () => {
    // TODO: implement rate limiting
  });

  test.todo('should retry on failures');
});