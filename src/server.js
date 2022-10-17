const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

app.get('/s', async (req, res) => {
    console.log('a')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.google.com/search?q=web+scraping+libros"); // URL is given by the "user" (your client-side application)
    const screenshotBuffer = await page.screenshot();

    // Respond with the image
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length
    });
    res.end(screenshotBuffer);

    await browser.close();
})

app.listen(4000);