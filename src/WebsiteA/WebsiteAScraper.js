const WebsiteCrawler = require('../core/WebsiteCrawler');

/**
 * Scraper for books.toscrape.com
 */
class WebsiteAScraper extends WebsiteCrawler {
  constructor() {
    super();
    this.baseUrl = 'https://books.toscrape.com/';
  }

  /**
   * Main scraping method.
   * @returns {Promise<Object>} { title, products[], scrapedAt }
   * @throws {Error} If extraction fails
   */
  async scrape() {
    try {
      await this.openBrowser();
      await this.goToPage(this.baseUrl);
      const data = await this.extractPageData();
      console.log(`[WebsiteA] Extracted ${data.products.length} products`);
      return data;
    } catch (error) {
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Extracts data from the current page.
   * @returns {Promise<Object>} { title, products[], scrapedAt }
   * @throws {Error} If product list cannot be parsed
   */
  async extractPageData() {
    const pageTitle = await this.page.title();

    const products = await this.page.$$eval('article.product_pod', articles => {
      return articles.map(article => {
        const titleElement = article.querySelector('h3 a');
        const priceElement = article.querySelector('.price_color');

        return {
          name: titleElement ? titleElement.getAttribute('title') : 'N/A',
          price: priceElement ? priceElement.textContent.trim() : 'N/A'
        };
      });
    });

    if (products.length === 0) {
      throw new Error('Failed to parse product list');
    }

    return {
      title: pageTitle,
      products: products,
      scrapedAt: new Date().toISOString()
    };
  }

  /**
   * Scrapes multiple pages with pagination.
   * @param {number} numPages - Number of pages to scrape
   * @returns {Promise<Object>} Combined data from all pages
   */
  async scrapeMultiplePages(numPages = 1) {
    try {
      await this.openBrowser();

      const allProducts = [];
      let currentPage = 1;

      await this.goToPage(this.baseUrl);

      while (currentPage <= numPages) {
        const pageData = await this.extractPageData();
        allProducts.push(...pageData.products);

        if (currentPage < numPages) {
          const hasNextPage = await this.goToNextPage();
          if (!hasNextPage) {
            break;
          }
        }

        currentPage++;
      }

      return {
        title: 'Books to Scrape - Multiple Pages',
        products: allProducts,
        totalPages: currentPage - 1,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Navigates to the next page.
   * @returns {Promise<boolean>} true if next page exists
   */
  async goToNextPage() {
    try {
      const nextButton = await this.page.$('.next a');

      if (!nextButton) {
        return false;
      }

      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
        nextButton.click()
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = WebsiteAScraper;