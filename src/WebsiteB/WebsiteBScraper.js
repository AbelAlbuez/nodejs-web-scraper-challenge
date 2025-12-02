const WebsiteCrawler = require('../core/WebsiteCrawler');

class WebsiteBScraper extends WebsiteCrawler {
  constructor() {
    super();
    this.baseUrl = 'https://news.ycombinator.com/';
  }

  async scrape() {
    try {
      await this.openBrowser();
      await this.goToPage(this.baseUrl);
      
      await this.page.waitForSelector('.athing', { timeout: 10000 });
      
      const data = await this.extractLatestPost();
      console.log(`[WebsiteB] Extracted latest post: "${data.latestPost.title}"`);
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  async extractLatestPost() {
    const postData = await this.page.evaluate(() => {
      const firstStory = document.querySelector('.athing');
      
      if (!firstStory) {
        throw new Error('No story found on page');
      }

      const titleLink = firstStory.querySelector('.titleline > a');
      const title = titleLink ? titleLink.textContent.trim() : 'N/A';

      const storyId = firstStory.getAttribute('id');
      
      const metadataRow = document.getElementById(storyId)?.nextElementSibling;
      
      let author = 'N/A';
      if (metadataRow) {
        const authorLink = metadataRow.querySelector('.hnuser');
        author = authorLink ? authorLink.textContent.trim() : 'N/A';
      }
      
      let comments = 0;
      if (metadataRow) {
        const commentsLink = Array.from(metadataRow.querySelectorAll('a'))
          .find(a => a.textContent.includes('comment'));
        
        if (commentsLink) {
          const commentsText = commentsLink.textContent.trim();
          const match = commentsText.match(/(\d+)/);
          comments = match ? parseInt(match[1], 10) : 0;
        }
      }

      return {
        title,
        author,
        comments
      };
    });

    if (postData.title === 'N/A') {
      throw new Error('Failed to extract latest post');
    }

    return {
      latestPost: {
        title: postData.title,
        author: postData.author,
        comments: postData.comments
      },
      scrapedAt: new Date().toISOString(),
      source: 'news.ycombinator.com'
    };
  }
}

module.exports = WebsiteBScraper;