import puppeteer from 'puppeteer';

let browser;
const pdfCache = new Map();

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

export default async function handler(req, res) {
  const { year, trainingName } = req.query;

  if (!year || !trainingName) {
    res.status(400).json({ error: 'Missing year or trainingName parameter' });
    return;
  }

  const cacheKey = `${year}_${trainingName}`;
  if (pdfCache.has(cacheKey)) {
    const cachedPdf = pdfCache.get(cacheKey);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Annual_Training_Calendar_${year}.pdf`);
    res.send(cachedPdf);
    return;
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/(trainingcalender)/annualtraining?year=${year}&trainingName=${encodeURIComponent(trainingName)}`;

  try {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    // Set a longer timeout for navigation and waiting for selector
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait for the table to be rendered with extended timeout
    await page.waitForSelector('#annual-training-table', { timeout: 60000 });

    // Generate PDF with landscape orientation
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
    });

    pdfCache.set(cacheKey, pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Annual_Training_Calendar_${year}.pdf`);
    res.send(pdfBuffer);

    await page.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
