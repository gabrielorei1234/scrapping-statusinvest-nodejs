const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeWebsite(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Add Headers to avoid Bot detection
    await page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,en;q=0.8'
    });

    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(url);

    const strongElement = await page.$$eval('.top-info .info strong', (elements) => {
        return elements.map(e => e.innerText);
    });

    const dataObject = {
        actualValue: strongElement[0],
        dividendYield: strongElement[3],
        valorization: strongElement[4],
        pvp: strongElement[6],
    };

    await browser.close();
    return dataObject;
}

async function scrapeWebsitesFromFile(filePath) {
    try {
        const websites = await fs.readFile(filePath, 'utf8');
        const websiteUrls = websites.split(',');

        const results = [];

        for (const url of websiteUrls) {
            const data = await scrapeWebsite(`https://statusinvest.com.br/fundos-imobiliarios/${url.trim()}`);
            results.push(data);
        }

        return results;
    } catch (error) {
        console.error('Error reading or scraping websites:', error);
        return [];
    }
}

(async () => {
    const results = await scrapeWebsitesFromFile('./cotas.txt');
    console.log(results);
    console.log("finished!");
})();
