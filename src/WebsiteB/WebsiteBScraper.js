const WebsiteCrawler = require('../core/WebsiteCrawler');

class WebsiteBScraper extends WebsiteCrawler {
  constructor() {
    super();
    this.baseUrl = 'https://medium.com/tag/programming';
  }

  async scrape() {
    try {
      await this.openBrowser();
      await this.goToPage(this.baseUrl);
      
      await this.page.waitForSelector('article h2, article h3', { timeout: 20000 });
      
      // console.log('Extracting latest post...');
      const data = await this.extractLatestPost();
      console.log(`[WebsiteB] Extracted latest post: "${data.latestPost.title}"`);
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  // HACK: multiple selectors because Medium changes DOM
  async extractLatestPost() {
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const postData = await this.page.evaluate(() => {
      const firstArticle = document.querySelector('article');
      
      if (!firstArticle) {
        throw new Error('No article found on page');
      }

      // Extract title
      let title = 'N/A';
      const titleSelectors = ['h2 a', 'h2', 'h3 a', 'h3'];
      
      for (const selector of titleSelectors) {
        const el = firstArticle.querySelector(selector);
        if (el) {
          const text = el.textContent?.trim();
          if (text && text.length > 5) {
            title = text;
            break;
          }
        }
      }

      // Extract author
      let author = 'N/A';
      const authorSelectors = ['a[href^="/@"]', '[data-testid="authorName"]', 'a[rel="author"]'];
      
      for (const selector of authorSelectors) {
        const a = firstArticle.querySelector(selector);
        if (a) {
          const text = a.textContent?.trim();
          if (text && text.length > 0 && text.length < 100) {
            author = text;
            break;
          }
        }
      }

      if (author === 'N/A') {
        const authorLink = firstArticle.querySelector('a[href*="/@"]');
        if (authorLink) {
          const text = authorLink.textContent?.trim();
          if (text && text.length > 0 && text.length < 100) {
            author = text;
          }
        }
      }

      // Extract post URL
      let postUrl = null;
      
      // Strategy 1: Try h2 a or h3 a (most common)
      const titleLink = firstArticle.querySelector('h2 a, h3 a');
      if (titleLink) {
        postUrl = titleLink.getAttribute('href');
      }
      
      // Strategy 2: Look for link in the title element's parent or nearby
      if (!postUrl) {
        const titleEl = firstArticle.querySelector('h2, h3');
        if (titleEl) {
          // Check if title itself is a link
          if (titleEl.tagName === 'A') {
            postUrl = titleEl.getAttribute('href');
          } else {
            // Check parent
            const parentLink = titleEl.closest('a');
            if (parentLink) {
              postUrl = parentLink.getAttribute('href');
            } else {
              // Check for link near the title
              const nearbyLink = titleEl.parentElement?.querySelector('a');
              if (nearbyLink) {
                postUrl = nearbyLink.getAttribute('href');
              }
            }
          }
        }
      }
      
      // Strategy 3: Find any link with substantial text that looks like a post URL
      if (!postUrl) {
        const allLinks = Array.from(firstArticle.querySelectorAll('a[href*="/"]'));
        // Sort by text length (longer text = more likely to be the post link)
        allLinks.sort((a, b) => {
          const aText = (a.textContent || '').trim().length;
          const bText = (b.textContent || '').trim().length;
          return bText - aText;
        });
        
        for (const link of allLinks) {
          const href = link.getAttribute('href') || '';
          const text = (link.textContent || '').trim();
          
          // Look for post-like URLs
          if (href.length > 15 && 
              !href.startsWith('#') && 
              !href.includes('?source=') &&
              !href.match(/^\/@[^\/]+$/) && // Not just author profile
              !href.includes('gitconnected') &&
              text.length > 10) {
            // Check if it looks like a post URL
            const pathParts = href.split('/').filter(p => p.length > 0);
            if (pathParts.length >= 2) {
              postUrl = href;
              break;
            }
          }
        }
      }

      return {
        title,
        author,
        postUrl
      };
    });

    if (postData.title === 'N/A' || postData.author === 'N/A') {
      throw new Error('Failed to extract latest post');
    }

    // Navigate to post to get comment count
    let comments = null;
    
    if (postData.postUrl) {
      try {
        const fullUrl = postData.postUrl.startsWith('http') 
          ? postData.postUrl 
          : `https://medium.com${postData.postUrl}`;
        
        await this.page.goto(fullUrl, { 
          waitUntil: 'networkidle0', 
          timeout: 60000 
        });
        
        // Wait for security check to complete
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Wait for content to load
        try {
          await this.page.waitForSelector('article', { timeout: 20000 });
        } catch (error) {
          await this.page.waitForSelector('body', { timeout: 5000 });
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // FIXME: timeout might be too aggressive
        // Aggressive scrolling to load all content
        await this.page.evaluate(async () => {
          let lastHeight = 0;
          let currentHeight = document.body.scrollHeight;
          let attempts = 0;
          let stableCount = 0;
          
          // Keep scrolling until page height stabilizes
          while (attempts < 30) {
            lastHeight = currentHeight;
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));
            currentHeight = document.body.scrollHeight;
            
            if (currentHeight === lastHeight) {
              stableCount++;
              if (stableCount >= 3) {
                break;
              }
            } else {
              stableCount = 0;
            }
            attempts++;
          }
          
          // Final scrolls
          for (let i = 0; i < 10; i++) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        });
        
        // Wait for Responses section to appear
        try {
          await this.page.waitForFunction(
            () => {
              const allText = document.body.textContent || document.body.innerText || '';
              return allText.includes('Responses') && allText.includes('(');
            },
            { timeout: 30000 }
          );
        } catch (error) {
          // Continue even if timeout
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Extract comments
        comments = await this.page.evaluate(() => {
          const allText = document.body.textContent || document.body.innerText || '';
          
          // Look for "Responses (1)" pattern
          let match = allText.match(/Responses\s*\((\d+)\)/i);
          if (match) {
            return parseInt(match[1], 10);
          }
          
          // Look for "Response (1)" (singular)
          match = allText.match(/Response\s*\((\d+)\)/i);
          if (match) {
            return parseInt(match[1], 10);
          }
          
          // Look for "1 responses" pattern
          match = allText.match(/(\d+)\s+responses?/i);
          if (match) {
            return parseInt(match[1], 10);
          }
          
          // Check h2 elements
          const h2Elements = document.querySelectorAll('h2');
          for (const h2 of h2Elements) {
            const text = (h2.textContent || h2.innerText || '').trim();
            if (text.includes('Responses') && text.includes('(')) {
              const match = text.match(/Responses\s*\((\d+)\)/i);
              if (match) {
                return parseInt(match[1], 10);
              }
            }
          }
          
          // Check all headings
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          for (const h of headings) {
            const text = (h.textContent || h.innerText || '').trim();
            if (text.toLowerCase().includes('response')) {
              const match = text.match(/(\d+)/);
              if (match) {
                return parseInt(match[1], 10);
              }
            }
          }
          
          return null;
        });
        
        // console.log('Found', comments, 'comments');
      } catch (error) {
        console.error(`[WebsiteB] Error extracting comments: ${error.message}`);
      }
    }

    return {
      latestPost: {
        title: postData.title,
        author: postData.author,
        comments: comments
      },
      scrapedAt: new Date().toISOString(),
      source: 'medium.com/tag/programming'
    };
  }
}

module.exports = WebsiteBScraper;

