const WebsiteCrawler = require('../core/WebsiteCrawler');

class WebsiteAScraper extends WebsiteCrawler {
  constructor() {
    super();
    this.baseUrl = 'https://books.toscrape.com/';
  }

  async scrape() {
    try {
      await this.openBrowser();
      await this.goToPage(this.baseUrl);
      // console.log('Starting extraction...');
      const data = await this.extractPageData();
      console.log(`[WebsiteA] Extracted ${data.products.length} products`);
      return data;
    } catch (error) {
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  async extractPageData() {
    const pageTitle = await this.page.title();

    const products = await this.page.$$eval('article.product_pod', articles => {
      return articles.map(article => {
        const title = article.querySelector('h3 a');
        const price = article.querySelector('.price_color');

        return {
          name: title ? title.getAttribute('title') : 'N/A',
          price: price ? price.textContent.trim() : 'N/A'
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

  // TODO: add retry logic here
  async scrapeMultiplePages(numPages = 1) {
    try {
      await this.openBrowser();

      const allProducts = [];
      var currentPage = 1;

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