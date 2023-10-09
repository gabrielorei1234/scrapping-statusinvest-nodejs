const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function baixarEProcessarCSV() {
    const url = 'https://statusinvest.com.br/category/AdvancedSearchResultExport?search=%7B%22Segment%22%3A%22%22%2C%22Gestao%22%3A%22%22%2C%22my_range%22%3A%220%3B20%22%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22percentualcaixa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotistas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividend_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22cota_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22patrimonio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valorpatrimonialcota%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lastdividend%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&CategoryType=2';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Upgrade-Insecure-Requests': '1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,en;q=0.8'
    };


    try {
        const response = await axios.get(url, { headers });
        const csvData = response.data;

        // Processar o CSV
        const records = [];
        csvData
            .trim() // Remover espaços em branco em excesso
            .split('\n') // Dividir em linhas
            .forEach((line, index) => {
                if (index === 0) {
                    // Alterar o cabeçalho conforme especificado
                    line = 'TICKER,PRECO,PREÇO VIRGULA,ULTIMO RENDIMENTO,ULTIMO DIVIDENDO,DY,DY VIRGULA,VAL. PATRIMONIAL P/COTA,VAL. PATRIMONIAL P/COTA VIRGULA,PVP Antes Virgula,P/VP Pós virgula,LIQUIDEZ MÉDIA DIÁRIA,LIQUIDEZ MÉDIA DIÁRIA VIRGULA,VALOR EM CAIXA,VALOR EM CAIXA VIRGULA,DY CAGR,DY CAGR VIRGULA,VALOR CAGR,VALOR CAGR VIRGULA,PATRIMONIO,?,N COTISTA,?,TIPO DA GESTÃO,N de Cotas,?';
                }
                records.push(line);
            });

        // Verificar se a pasta "FIIs" existe, e criá-la se não existir
        const fiisDir = './FIIs';
        if (!fs.existsSync(fiisDir)) {
            fs.mkdirSync(fiisDir);
        }

        // Gerar um nome de arquivo único com base na data e hora
        const dataAtual = new Date().toISOString().replace(/[:T.]/g, '-');
        const nomeArquivo = `FIIs/fundos_imobiliarios_${dataAtual}.csv`;

        // Salvar o CSV processado
        fs.writeFileSync(nomeArquivo, records.join('\n'));
        console.log(`CSV processado e salvo em: ${nomeArquivo}`);
    } catch (error) {
        console.error('Erro ao baixar e processar o CSV:', error);
    }
}

async function baixarCSVAcoes() {
    const url = 'https://statusinvest.com.br/category/AdvancedSearchResultExport?search=%7B%22Sector%22%3A%22%22%2C%22SubSector%22%3A%22%22%2C%22Segment%22%3A%22%22%2C%22my_range%22%3A%22-20%3B100%22%2C%22forecast%22%3A%7B%22upsidedownside%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22estimatesnumber%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22revisedup%22%3Atrue%2C%22reviseddown%22%3Atrue%2C%22consensus%22%3A%5B%5D%7D%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_l%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22peg_ratio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margembruta%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemliquida%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22ev_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidaebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidapatrimonioliquido%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_sr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_capitalgiro%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativocirculante%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roe%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roic%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezcorrente%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22pl_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22passivo_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22giroativos%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22receitas_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lucros_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22vpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valormercado%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&CategoryType=1';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Upgrade-Insecure-Requests': '1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,en;q=0.8'
    };


    try {
        const response = await axios.get(url, { headers });
        const csvData = response.data;

        // Processar o CSV
        const records = [];
        csvData
            .trim() // Remover espaços em branco em excesso
            .split('\n') // Dividir em linhas
            .forEach((line, index) => {
                records.push(line);
            });

        // Verificar se a pasta "FIIs" existe, e criá-la se não existir
        const fiisDir = './Acoes';
        if (!fs.existsSync(fiisDir)) {
            fs.mkdirSync(fiisDir);
        }

        // Gerar um nome de arquivo único com base na data e hora
        const dataAtual = new Date().toISOString().replace(/[:T.]/g, '-');
        const nomeArquivo = `Acoes/Acoes_${dataAtual}.csv`;

        // Salvar o CSV processado
        fs.writeFileSync(nomeArquivo, records.join('\n'));
        console.log(`CSV processado e salvo em: ${nomeArquivo}`);
    } catch (error) {
        console.error('Erro ao baixar e processar o CSV:', error);
    }
}

async function scrapeStatusInvest() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://statusinvest.com.br/fundos-imobiliarios/busca-avancada');

    // Espere até que o botão "Buscar" seja visível
    await page.waitForSelector('[data-tooltip="Clique para fazer a busca com base nos valores informados"]');

    // Clique no botão "Buscar" com base na propriedade data-tooltip
    await page.click('[data-tooltip="Clique para fazer a busca com base nos valores informados"]');

    console.log('Vou clicar no dropdown');

    await page.waitForSelector('.select-dropdown.dropdown-trigger', { visible: true });
    await page.click('.select-dropdown.dropdown-trigger');


    // console.log('Cliquei no dropdown');

    // // Espere até que a lista suspensa seja visível
    // await page.waitForSelector('ul.select-dropdown li:nth-child(3)');

    await page.waitForSelector('ul.select-dropdown');

    // Clique na opção "TODOS" na lista suspensa
    await page.evaluate(() => {
        const elements = document.querySelectorAll('ul.select-dropdown li');
        console.log(element)
        for (const element of elements) {
            console.log(element)
            if (element.textContent.trim() === 'TODOS') {
                element.click();
                break;
            }
        }
    });


    // Espere a tabela de resultados ser carregada
    await page.waitForSelector('.table-scroll table tbody tr.item', { timeout: 10000 });

    // Extraia os dados da tabela
    const data = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.table-scroll table tbody tr.item'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const ticker = cells[0].textContent.trim();
            const price = cells[1].textContent.trim();
            const gestao_f = cells[2].textContent.trim();
            const dy = cells[3].textContent.trim();
            const p_vp = cells[4].textContent.trim();
            const percentualcaixa = cells[5].textContent.trim();
            const numerocotistas = cells[6].textContent.trim();
            const dividend_cagr = cells[7].textContent.trim();
            const cota_cagr = cells[8].textContent.trim();
            const liquidezmediadiaria = cells[9].textContent.trim();
            const patrimonio = cells[10].textContent.trim();
            const valorpatrimonialcota = cells[11].textContent.trim();
            const numerocotas = cells[12].textContent.trim();
            const lastdividend = cells[13].textContent.trim();

            return {
                ticker,
                price,
                gestao_f,
                dy,
                p_vp,
                percentualcaixa,
                numerocotistas,
                dividend_cagr,
                cota_cagr,
                liquidezmediadiaria,
                patrimonio,
                valorpatrimonialcota,
                numerocotas,
                lastdividend
            };
        });
    });

    await browser.close();

    return data;
}

function normalizeCSV(inputFilePath) {
    // Leia o arquivo CSV
    const csvData = fs.readFileSync(inputFilePath, 'utf8');

    // Divida o CSV em linhas e converta em uma matriz de strings
    const rows = csvData.trim().split('\n').map(row => row.split(';'));
    let normalizedRows = [];

    // Normalize os dados com base nas condições especificadas
    let indice = 0;
    for (const row of rows) {
        if (indice !== 0) {
            const myObject = {
                name: row[0],
                value: row[1],
                lastDividend: row[2],
                dividendYield: row[3],
                patrimonialValuePerCota: row[4],
                pvp: row[5],
                dailyLiquid: row[6],
                valueInBox: row[7],
                dividendYieldCarg: row[8],
                valueCarg: row[9],
                patrimonio: row[10],
                cotistaNumber: row[11],
                gestiumType: row[12],
                costasNumber: row[13],
            }

            console.log('gestão', myObject.gestiumType)
            normalizedRows.push(myObject);
        }

        indice += 1;
    }

    // Construa a string CSV normalizada
    let normalizedCSV = 'Nome;Valor;Último Dividendo;Dividend Yield;Valor Patrimonial Por Cota;P/VP;Liquidez Diária;Valor em Caixa;DY CARG;Valor CARG;Patrimônio;Número de Cotistas;Tipo de Gestão;Número de Cotas\n';

    for (const row of normalizedRows) {
        const values = Object.values(row).join(';');
        normalizedCSV += values + '\n';
    }

    // Determine o nome do arquivo de saída
    const outputPath = inputFilePath.replace('.csv', '_fix.csv');

    // Salve o arquivo normalizado
    fs.writeFileSync(outputPath, normalizedCSV, 'utf8');

    console.log('Arquivo normalizado e salvo como', outputPath);
}


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
    const pesoPvp = 0.2;
    const pesoDividendYield = 0.3;
    const pesoValorizacao = 0.2;
    const pesoLucro = 0.2;
    const pesoValorAtual = 0.1;

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

// (async () => {
//     let results = await scrapeWebsitesFromFile('./cotas.txt');
//     results = normalizeData(results);
//     // Filtrar fundos com P/VP, Dividend Yield e Valorização definidos (remover aqueles com valores indefinidos)
//     const fundosComIndicadoresDefinidos = results.filter(fundo => !isNaN(fundo.pvp) && !isNaN(fundo.dividendYield) && !isNaN(fundo.valorization) && !isNaN(fundo.actualValue));

//     // Adicionar campo "Lucro" com base no Dividend Yield e Valor Atual
//     fundosComIndicadoresDefinidos.forEach(fundo => {
//         fundo.lucro = (fundo.dividendYield / 100) * fundo.actualValue;
//     });

//     // Ordenar os resultados com base na função de classificação personalizada
//     fundosComIndicadoresDefinidos.sort(customSort);

//     console.log("Fundos classificados por vários fatores:");
//     console.log(fundosComIndicadoresDefinidos);
//     // Criar a planilha e salvar
//     await criarPlanilha(fundosComIndicadoresDefinidos);
// })();

// (async () => {
//     await baixarEProcessarCSV();
//     console.log("Finished!");
// })();

// (async () => {
//     const data = await scrapeStatusInvest();

//     // Escreva os dados em um arquivo CSV
//     const csvHeader = 'TICKER,PRECO,GESTAO_F,DY,P_VP,PERCENTUALCAIXA,NUMEROCOTISTAS,DIVIDEND_CAGR,COTA_CAGR,LIQUIDEZMEDIADIARIA,PATRIMONIO,VALORPATRIMONIALCOTA,NUMEROCOTAS,LASTDIVIDEND\n';
//     const csvData = data.map(item => `${item.ticker},${item.price},${item.gestao_f},${item.dy},${item.p_vp},${item.percentualcaixa},${item.numerocotistas},${item.dividend_cagr},${item.cota_cagr},${item.liquidezmediadiaria},${item.patrimonio},${item.valorpatrimonialcota},${item.numerocotas},${item.lastdividend}`).join('\n');
//     fs.writeFileSync('fundos_imobiliarios.csv', csvHeader + csvData, 'utf-8');
//     console.log('Dados exportados para fundos_imobiliarios.csv');
// })();

//baixarEProcessarCSV();
//normalizeCSV('FIIs/fundos_imobiliarios_2023-10-08-15-51-47-629Z.csv');
baixarCSVAcoes();
