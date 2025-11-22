const puppeteer = require('puppeteer');

// Base crawler class for web scraping
class WebsiteCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  // Opens browser and creates new page
  async openBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // Hide webdriver property
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });
      
      this.page.setDefaultTimeout(30000);

    } catch (error) {
      await this.closeBrowser();
      throw new Error(`Browser launch failed: ${error.message}`);
    }
  }

  // Navigates to URL
  async goToPage(url) {
    if (!this.browser || !this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    } catch (error) {
      throw new Error('Navigation failed');
    }
  }

  // Closes browser - never throws
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

  isReady() {
    return this.browser !== null && this.page !== null;
  }

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
