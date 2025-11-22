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

  test('initializes with baseUrl', () => {
    expect(scraper.baseUrl).toBe('https://books.toscrape.com/');
  });

  test('extends WebsiteCrawler', () => {
    expect(scraper.browser).toBeNull();
    expect(scraper.page).toBeNull();
  });

  test('scrapes page and returns data with title and products', async () => {
    const data = await scraper.scrape();

    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('products');
    expect(data).toHaveProperty('scrapedAt');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);
  }, 60000);

  test('returns products with name and price', async () => {
    const data = await scraper.scrape();

    expect(data.products[0]).toHaveProperty('name');
    expect(data.products[0]).toHaveProperty('price');
    expect(typeof data.products[0].name).toBe('string');
    expect(typeof data.products[0].price).toBe('string');
  }, 60000);

  test('closes browser after scraping', async () => {
    await scraper.scrape();
    expect(scraper.browser).toBeNull();
    expect(scraper.page).toBeNull();
  }, 60000);

  test('extracts page title', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    
    const data = await scraper.extractPageData();
    expect(data.title).toBeTruthy();
    expect(typeof data.title).toBe('string');
  }, 60000);

  test('extracts products array', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    
    const data = await scraper.extractPageData();
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);
  }, 60000);

  test('throws error if no products found', async () => {
    await scraper.openBrowser();
    await scraper.goToPage('https://books.toscrape.com/catalogue/page-999.html');
    
    await expect(scraper.extractPageData()).rejects.toThrow('Failed to parse product list');
  }, 60000);

  test('includes scrapedAt timestamp', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    
    const data = await scraper.extractPageData();
    expect(data.scrapedAt).toBeTruthy();
    expect(new Date(data.scrapedAt).getTime()).toBeGreaterThan(0);
  }, 60000);

  test('scrapes single page when numPages is 1', async () => {
    const data = await scraper.scrapeMultiplePages(1);

    expect(data).toHaveProperty('products');
    expect(data).toHaveProperty('totalPages');
    expect(data.totalPages).toBe(1);
    expect(data.products.length).toBeGreaterThan(0);
  }, 60000);

  test('scrapes multiple pages', async () => {
    const data = await scraper.scrapeMultiplePages(2);

    expect(data.totalPages).toBe(2);
    expect(data.products.length).toBeGreaterThan(0);
    expect(data.title).toBe('Books to Scrape - Multiple Pages');
  }, 90000);

  test('closes browser after multi-page scraping', async () => {
    await scraper.scrapeMultiplePages(1);
    expect(scraper.browser).toBeNull();
    expect(scraper.page).toBeNull();
  }, 60000);

  test('navigates to next page if available', async () => {
    await scraper.openBrowser();
    await scraper.goToPage(scraper.baseUrl);
    
    const initialUrl = scraper.page.url();
    const hasNext = await scraper.goToNextPage();
    
    expect(hasNext).toBe(true);
    expect(scraper.page.url()).not.toBe(initialUrl);
  }, 60000);

  test('returns false when no next page', async () => {
    await scraper.openBrowser();
    await scraper.goToPage('https://books.toscrape.com/catalogue/page-50.html');
    
    let hasNext = true;
    let attempts = 0;
    while (hasNext && attempts < 5) {
      hasNext = await scraper.goToNextPage();
      attempts++;
    }
    
    expect(hasNext).toBe(false);
  }, 120000);

  test.skip('should handle network errors gracefully', () => {
    // TODO: test network error handling
  });
});

