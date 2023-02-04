const express = require('express')
// const puppeteer = require('puppeteer')
const dotenv = require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
function sleep(seconds, fun = () => {}) {
    return new Promise(r => setTimeout(()=>{fun(); r()}, seconds * 1000))
}

let chrome = {};
let puppeteer;
if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}

app.get('/api/start', async (req, res) => {
    let options = {};
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
          args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
        };
    }
    try {
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage()
        await page.goto('https://kaggle.com')
        
        await page.click('#site-container > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) a')
        await sleep(1)
        await page.click('form > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) a')
        await sleep(1)
        await page.type('[name="email"]', process.env.KAGGLE_EMAIL)
        await page.type('[name="password"]', process.env.KAGGLE_PASS)
        await page.click('[type="submit"]')
        await page.waitForNavigation()
        
        await page.goto('https://www.kaggle.com/code/krksaikumar/automateytchannel/edit')
        await sleep(30)
        await page.click('[title="Run all"]')
        await sleep(10)
        await sleep(1 * 30 * 60)
        

        
        
        browser.close()
        res.status(200).json({ message: 'Success'})

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))