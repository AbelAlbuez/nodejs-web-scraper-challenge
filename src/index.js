const WebsiteAScraper = require('./WebsiteA/WebsiteAScraper');
const WebsiteBScraper = require('./WebsiteB/WebsiteBScraper');
const fs = require('fs');
const path = require('path');

async function runWebsiteAScraper() {
  const scraper = new WebsiteAScraper();
  const data = await scraper.scrape();
  
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'websiteA_results.json');
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`[WebsiteA] Scraped ${data.products.length} products`);
  console.log(`[WebsiteA] Saved to: ${outputFile}`);

  return data;
}

async function runWebsiteBScraper() {
  const scraper = new WebsiteBScraper();
  const data = await scraper.scrape();
  
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'websiteB_results.json');
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`[WebsiteB] Latest post: "${data.latestPost.title}"`);
  console.log(`[WebsiteB] Saved to: ${outputFile}`);

  return data;
}

async function runMultiplePages() {
  const scraper = new WebsiteAScraper();

  try {
    console.log('\n=== Running WebsiteA Multi-Page Scraper ===');
    const data = await scraper.scrapeMultiplePages(3);
    
    console.log(`Scraped ${data.products.length} products from ${data.totalPages} pages`);

    const outputFile = path.join(__dirname, 'output', 'websiteA_multiple_pages.json');
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`Saved results to: ${outputFile}`);

  } catch (error) {
    console.error('Error in multi-page scraping:', error.message);
    throw error;
  }
}

// TODO: add error recovery mechanism
async function main() {
  try {
    const websiteAData = await runWebsiteAScraper();
    const websiteBData = await runWebsiteBScraper();

    const results = {
      websiteA: websiteAData,
      websiteB: websiteBData
    };

    const combinedFile = path.join(__dirname, 'output', 'final_results.json');
    fs.writeFileSync(combinedFile, JSON.stringify(results, null, 2));
    console.log(`[Combined] Saved to: ${combinedFile}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();