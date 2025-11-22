const puppeteer = require('puppeteer');

/**
 * Base class for web scraping with Puppeteer.
 * Handles browser lifecycle and navigation. Child classes handle data extraction.
 */
class WebsiteCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Launches Puppeteer and opens a new page.
   * @returns {Promise<void>}
   * @throws {Error} If Puppeteer launch fails
   */
  async openBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      this.page.setDefaultTimeout(30000);

    } catch (error) {
      await this.closeBrowser();
      throw new Error(`Failed to open browser: ${error.message}`);
    }
  }

  /**
   * Navigates to a URL.
   * @param {string} url - Target URL
   * @returns {Promise<void>}
   * @throws {Error} If browser is not open or navigation fails
   */
  async goToPage(url) {
    if (!this.browser || !this.page) {
      throw new Error('Browser is not open. Call openBrowser() first.');
    }

    try {
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    } catch (error) {
      throw new Error(`Navigation failed: ${error.message}`);
    }
  }

  /**
   * Closes browser and page. Never throws - catches errors internally.
   * @returns {Promise<void>}
   */
  async closeBrowser() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Checks if browser and page are ready.
   * @returns {boolean}
   */
  isReady() {
    return this.browser !== null && this.page !== null;
  }

  /**
   * Extracts text from the first matching element.
   * @param {string} selector - CSS selector
   * @returns {Promise<string|null>}
   */
  async extractText(selector) {
    try {
      const text = await this.page.$eval(
        selector, 
        el => el.textContent.trim()
      );
      return text;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extracts text from all matching elements.
   * @param {string} selector - CSS selector
   * @returns {Promise<Array<string>>}
   */
  async extractTextFromAll(selector) {
    try {
      const texts = await this.page.$$eval(
        selector,
        elements => elements.map(el => el.textContent.trim())
      );
      return texts;
    } catch (error) {
      return [];
    }
  }
}

module.exports = WebsiteCrawler;
