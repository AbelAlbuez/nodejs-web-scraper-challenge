# Web Scraper - NodeJS Challenge

A web scraping application built with NodeJS and Puppeteer that extracts data from multiple websites using object-oriented design.

## Features

- Base crawler class with reusable browser management
- Specialized scrapers for different website structures
- Multi-page pagination support
- Comprehensive error handling
- Unit tests with Jest
- JSON output format

## Project Structure

```
.
├── core/
│   ├── WebsiteCrawler.js       # Base crawler class
│   └── WebsiteCrawler.test.js  # Base class tests
├── WebsiteA/
│   ├── WebsiteAScraper.js      # Books.toscrape.com scraper
│   └── WebsiteAScraper.test.js # Website A tests
├── WebsiteB/
│   ├── WebsiteBScraper.js      # Medium.com scraper
│   └── WebsiteBScraper.test.js # Website B tests
├── output/                      # Generated JSON files (created on run)
├── index.js                     # Main entry point
└── package.json
```

## Installation

1. Install Node.js (v14 or higher)

2. Install dependencies:
```bash
npm install
```

## Usage

Run both scrapers:
```bash
node index.js
```

This will create three JSON files in the `output/` directory:
- `websiteA_results.json` - Product data from Books to Scrape
- `websiteB_results.json` - Latest blog post from Medium
- `final_results.json` - Combined results

### Output Examples

**Website A (Books to Scrape):**
```json
{
  "title": "All products | Books to Scrape - Sandbox",
  "products": [
    {
      "name": "A Light in the Attic",
      "price": "£51.77"
    }
  ],
  "scrapedAt": "2024-11-22T10:30:00.000Z"
}
```

**Website B (Medium):**
```json
{
  "latestPost": {
    "title": "Understanding JavaScript Closures",
    "author": "John Developer",
    "comments": 42
  },
  "scrapedAt": "2024-11-22T10:30:00.000Z",
  "source": "medium.com/tag/programming"
}
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Architecture

### WebsiteCrawler (Base Class)

Provides common functionality for all scrapers:

- `openBrowser()` - Launches headless Chrome browser
- `goToPage(url)` - Navigates to a URL
- `closeBrowser()` - Cleans up browser resources
- `isReady()` - Checks if browser is initialized
- `extractText(selector)` - Extracts text from an element
- `extractTextFromAll(selector)` - Extracts text from multiple elements

### WebsiteAScraper

Scrapes product listings from Books to Scrape:

- Extracts product names and prices
- Supports multi-page scraping with pagination
- Uses CSS selectors: `article.product_pod`, `h3 a`, `.price_color`

**Methods:**
- `scrape()` - Scrapes single page
- `scrapeMultiplePages(numPages)` - Scrapes across multiple pages
- `extractPageData()` - Extracts products from current page
- `goToNextPage()` - Navigates to next page

### WebsiteBScraper

Scrapes blog posts from Medium:

- Extracts latest post title, author, and comments
- Handles dynamic content loading
- Multiple selector strategies for reliability

**Methods:**
- `scrape()` - Main scraping method
- `extractLatestPost()` - Extracts post details including comments

## Technical Details

### Browser Configuration

- Runs in headless mode
- Uses Chrome user agent to avoid detection
- 30-second timeout for page loads
- Waits for network idle before extracting data

### Error Handling

- Browser failures are caught and logged
- Navigation errors throw descriptive messages
- Cleanup always happens in `finally` blocks
- Missing elements return null or empty arrays

### Testing

- Unit tests for all classes and methods
- Integration tests for end-to-end scraping
- Error case coverage
- Proper cleanup in `beforeEach`/`afterEach`

## Dependencies

```json
{
  "puppeteer": "^21.0.0",
  "jest": "^29.0.0"
}
```

## Troubleshooting

**Browser won't launch:**
- Check Chrome/Chromium installation
- Verify sufficient permissions
- The `--no-sandbox` flag is already included

**Timeouts:**
- Website B (Medium) may take 30-60 seconds due to dynamic content
- Check your internet connection
- Some websites may be temporarily unavailable

**Missing data:**
- Websites may change their HTML structure
- Selectors may need updating
- Check console output for specific errors

## Notes

- Output directory is created automatically
- Browser runs in headless mode for better performance
- Medium scraping includes delays for security checks and content loading
- All scraped data includes ISO timestamps

## Future Improvements

- Retry logic for failed requests
- Configuration file for URLs and selectors
- Rate limiting implementation
- Search functionality from home page
- More website adapters
- CLI arguments for selective scraping