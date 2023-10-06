const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;


// https://statusinvest.com.br/category/AdvancedSearchResultExport?search=%7B%22Segment%22%3A%22%22%2C%22Gestao%22%3A%22%22%2C%22my_range%22%3A%220%3B20%22%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22percentualcaixa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotistas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividend_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22cota_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22patrimonio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valorpatrimonialcota%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lastdividend%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&CategoryType=2

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

function normalizeData(data) {
    // Converter os valores de P/VP, Dividend Yield e Valorização para números antes de ordenar
    data.forEach(fundo => {
        if (fundo.pvp !== undefined) {
            fundo.pvp = parseFloat(fundo.pvp.replace(',', '.'));
        }
        if (fundo.dividendYield !== undefined) {
            fundo.dividendYield = parseFloat(fundo.dividendYield.replace(',', '.'));
        }
        if (fundo.valorization !== undefined) {
            fundo.valorization = parseFloat(fundo.valorization.replace('%', '').replace(',', '.'));
        }
        if (fundo.actualValue !== undefined) {
            fundo.actualValue = parseFloat(fundo.actualValue.replace(',', '.'));
        }
    });

    return data;
}

// Criar uma função de classificação personalizada
function customSort(a, b) {
    // Você pode ajustar os pesos para cada métrica conforme necessário
    const pesoPvp = 0.5;
    const pesoDividendYield = 0.4;
    const pesoValorizacao = 0.2;
    const pesoLucro = 0.4;
    const pesoValorAtual = 0.3;

    // Calcular a pontuação ponderada para cada fundo
    const pontuacaoA = (a.pvp * pesoPvp) + (a.dividendYield * pesoDividendYield) + (a.valorization * pesoValorizacao) + (a.lucro * pesoLucro) + (a.actualValue * pesoValorAtual);
    const pontuacaoB = (b.pvp * pesoPvp) + (b.dividendYield * pesoDividendYield) + (b.valorization * pesoValorizacao) + (b.lucro * pesoLucro) + (b.actualValue * pesoValorAtual);

    return pontuacaoB - pontuacaoA; // Classificar do maior para o menor
}

async function criarPlanilha(fundos) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fundos Imobiliários');

    // Definir cabeçalhos
    worksheet.addRow(['Nome do FII', 'P/VP', 'Dividend Yield', 'Valorização', 'Lucro', 'Valor Atual']);

    // Preencher os dados
    fundos.forEach(fundo => {
        worksheet.addRow([
            fundo.name,
            fundo.pvp,
            fundo.dividendYield,
            fundo.valorization,
            fundo.lucro,
            fundo.actualValue
        ]);
    });

    // Verificar se a pasta "historico" existe, e criá-la se não existir
    const historicoDir = './historico';
    try {
        await fs.access(historicoDir);
    } catch (err) {
        await fs.mkdir(historicoDir);
    }

    // Gerar um nome de arquivo único com base na data e hora
    const dataAtual = new Date().toISOString().replace(/[:T.]/g, '-');
    const nomeArquivo = `historico/fundos_imobiliarios_${dataAtual}.xlsx`;

    // Salvar a planilha
    await workbook.xlsx.writeFile(nomeArquivo);
    console.log(`Planilha criada e salva em: ${nomeArquivo}`);
}

(async () => {
    let results = await scrapeWebsitesFromFile('./cotas.txt');
    results = normalizeData(results);
    // Filtrar fundos com P/VP, Dividend Yield e Valorização definidos (remover aqueles com valores indefinidos)
    const fundosComIndicadoresDefinidos = results.filter(fundo => !isNaN(fundo.pvp) && !isNaN(fundo.dividendYield) && !isNaN(fundo.valorization) && !isNaN(fundo.actualValue));

    // Adicionar campo "Lucro" com base no Dividend Yield e Valor Atual
    fundosComIndicadoresDefinidos.forEach(fundo => {
        fundo.lucro = (fundo.dividendYield / 100) * fundo.actualValue;
    });

    // Ordenar os resultados com base na função de classificação personalizada
    fundosComIndicadoresDefinidos.sort(customSort);

    console.log("Fundos classificados por vários fatores:");
    console.log(fundosComIndicadoresDefinidos);
    // Criar a planilha e salvar
    await criarPlanilha(fundosComIndicadoresDefinidos);
})();

