const WebsiteBScraper = require('./WebsiteBScraper');

describe('WebsiteBScraper', () => {
  let scraper;

  beforeEach(() => {
    scraper = new WebsiteBScraper();
  });

  afterEach(async () => {
    if (scraper.browser) {
      await scraper.closeBrowser();
    }
  });

  test('initializes with baseUrl', () => {
    expect(scraper.baseUrl).toBe('https://news.ycombinator.com/');
  });

  test('extends WebsiteCrawler', () => {
    expect(scraper.browser).toBeNull();
    expect(scraper.page).toBeNull();
  });

  test('has isReady method', () => {
    expect(typeof scraper.isReady).toBe('function');
    expect(scraper.isReady()).toBe(false);
  });

  test('scrapes page and returns data with latestPost', async () => {
    const data = await scraper.scrape();

    expect(data).toHaveProperty('latestPost');
    expect(data).toHaveProperty('scrapedAt');
    expect(data).toHaveProperty('source');
    expect(data.source).toBe('news.ycombinator.com');
  }, 30000);

  test('returns latestPost with title, author and comments', async () => {
    const data = await scraper.scrape();

    expect(data.latestPost).toHaveProperty('title');
    expect(data.latestPost).toHaveProperty('author');
    expect(data.latestPost).toHaveProperty('comments');
    
    expect(typeof data.latestPost.title).toBe('string');
    expect(data.latestPost.title).not.toBe('N/A');
    expect(data.latestPost.title.length).toBeGreaterThan(0);
    
    expect(typeof data.latestPost.author).toBe('string');
    expect(data.latestPost.author.length).toBeGreaterThan(0);
    
    expect(typeof data.latestPost.comments).toBe('number');
    expect(data.latestPost.comments).toBeGreaterThanOrEqual(0);
  }, 30000);

  test('closes browser after scraping', async () => {
    await scraper.scrape();
    
    expect(scraper.browser).toBeNull();
    expect(scraper.page).toBeNull();
  }, 30000);

  test('includes valid ISO timestamp', async () => {
    const data = await scraper.scrape();
    
    expect(data.scrapedAt).toBeTruthy();
    const date = new Date(data.scrapedAt);
    expect(date.getTime()).toBeGreaterThan(0);
    expect(isNaN(date.getTime())).toBe(false);
  }, 30000);

  test('extracts post data with required fields', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    await scraper.page.waitForSelector('.athing', { timeout: 10000 });
    
    const data = await scraper.extractLatestPost();

    expect(data).toHaveProperty('latestPost');
    expect(data.latestPost).toHaveProperty('title');
    expect(data.latestPost).toHaveProperty('author');
    expect(data.latestPost).toHaveProperty('comments');
  }, 30000);

  test('does not return N/A for title', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    await scraper.page.waitForSelector('.athing', { timeout: 10000 });
    
    const data = await scraper.extractLatestPost();

    expect(data.latestPost.title).not.toBe('N/A');
    expect(data.latestPost.title.length).toBeGreaterThan(0);
  }, 30000);

  test('includes source and timestamp', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    await scraper.page.waitForSelector('.athing', { timeout: 10000 });
    
    const data = await scraper.extractLatestPost();

    expect(data.source).toBe('news.ycombinator.com');
    expect(data.scrapedAt).toBeTruthy();
  }, 30000);

  test('handles browser close gracefully', async () => {
    await scraper.openBrowser();
    await scraper.closeBrowser();
    
    expect(scraper.browser).toBeNull();
    expect(scraper.page).toBeNull();
  }, 30000);

  test('is not ready after closing', async () => {
    await scraper.openBrowser();
    expect(scraper.isReady()).toBe(true);
    
    await scraper.closeBrowser();
    expect(scraper.isReady()).toBe(false);
  }, 30000);

  test('throws error if page has no stories', async () => {
    await scraper.openBrowser();
    await scraper.page.setContent('<html><body></body></html>');
    
    await expect(scraper.extractLatestPost()).rejects.toThrow('No story found on page');
  }, 30000);

  test('closes browser even on error', async () => {
    try {
      await scraper.openBrowser();
      await scraper.page.setContent('<html><body></body></html>');
      await scraper.extractLatestPost();
    } catch (error) {
    }
    
    await scraper.closeBrowser();
    expect(scraper.browser).toBeNull();
  }, 30000);
});