const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeWebsite(url) {
    const browser = await puppeteer.launch({ headless: false });
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
        name: url.split('/').at(-1),
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

        let results = [];

        for (const url of websiteUrls) {
            const data = await scrapeWebsite(`${url.trim()}`);
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

    // Converter os valores de P/VP para números antes de ordenar
    results.forEach(fundo => {
        if (fundo.pvp !== undefined) {
            fundo.pvp = parseFloat(fundo.pvp.replace(',', '.'));
        }
    });

    // Filtrar fundos com P/VP definido (remover aqueles com P/VP indefinido)
    const fundosComPvpDefinido = results.filter(fundo => !isNaN(fundo.pvp));

    // Ordenar os resultados com base no P/VP (do menor para o maior)
    fundosComPvpDefinido.sort((a, b) => b.pvp - a.pvp);

    console.log("Fundos classificados por P/VP:");
    console.log(fundosComPvpDefinido);

    console.log("Finished!");
})();
