const WebsiteAScraper = require('./WebsiteA/WebsiteAScraper');
const fs = require('fs');
const path = require('path');

async function runScraper() {
  const scraper = new WebsiteAScraper();

  try {
    const data = await scraper.scrape();
    
    console.log(`Scraped ${data.products.length} products`);
    console.log(`Title: ${data.title}`);

    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'websiteA_results.json');
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`Saved results to: ${outputFile}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function runMultiplePages() {
  const scraper = new WebsiteAScraper();

  try {
    const data = await scraper.scrapeMultiplePages(3);
    
    console.log(`Scraped ${data.products.length} products from ${data.totalPages} pages`);

    const outputFile = path.join(__dirname, 'output', 'websiteA_multiple_pages.json');
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`Saved results to: ${outputFile}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function main() {
  await runScraper();
  // await runMultiplePages();
}

main();