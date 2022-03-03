const {webkit} = require('playwright');  // Or 'chromium' or 'firefox'.

const AIR = async () => {
    const browser = await webkit.launch();
    let context;

    const handleLogin = async (log, pwd) => {
        if (!log || !pwd) return false

        let page
        try {
            if (context) {
                await context.close()
            }
            context = await browser.newContext();

            page = await context.newPage();

            await page.goto('http://www.instagram.com/');
            await handleScreenshot(page)
            console.log('Goto login success...')
            await page.waitForSelector('input[name=username]')
            await page.fill('input[name=username]', log)
            console.log('Filled login...')

            await page.waitForSelector('input[name=password]')
            await page.fill('input[name=password]', pwd)
            console.log('Filled password...')

            // const $login_btn = await page.waitForSelector('button[type=submit]')
            await page.click('button[type=submit]')

            // // const res = await page.waitForResponse('https://www.instagram.com/accounts/login/ajax/')
            //
            // const r = await page.waitForResponse(response => response.url() === 'https://www.instagram.com/accounts/login/ajax/' && response.status() === 200)

            console.log('Try login...')
            await page.waitForSelector('svg[width="24"]')
            console.log('Login success...')


            let btn = (await page.$$('button'))[0]

            await btn.click()
            await context.storageState({path: 'state.json'});

            console.log('Save browser info success!')

            return true
        } catch (e) {
            if (page) {
                await handleScreenshot(page, true)
            }
            return false
        }
    }

    const handleReportPage = async (url) => {
        if (!url) return false;
        const page = await context.newPage();

        let user = ''

        try {
            user = (new URL(url)).pathname.split('/')[1]
        } catch (e) {
            console.log(`\nError!\nURL: ${url}\nis not valid!\n`)
        }

        try {
            console.log(`[1/6]: GOTO -> ${url}`)
            await page.goto(url)
            console.log('[2/6]: GOTO LOADING ')
            await page.waitForSelector('button[type=button]')
            console.log('[3/6]: Goto success!');

            await (await page.$$('button[type=button]'))[1].click()

            let btn = (await page.$$('button[tabindex="0"]'))[2]

            await btn.click()

            await page.waitForSelector('div[role=list]')
            await page.click('div[role=list] button:last-child')
            // await page.click('svg[fill=#262626]')

            await page.waitForSelector('button > div > div:last-child > div')

            console.log('[4/6]: Step 1')

            let idx = 0
            while ((await page.$$('div[role=list] button')).length !== 3) {
                if (idx >= 100) {
                    return new Error('Step 1')
                }
            }
            await page.click('div[role=list] button:first-child')

            console.log('[5/6]: Step 2')
            idx = 0
            while ((await page.$$('div[role=list] button')).length <= 5) {
                if (idx >= 100) {
                    return new Error('Step 2')
                }
            }
            await page.click('div[role=list] button:last-child')

            idx = 0
            while ((await page.$$('div[role=list] button')).length >= 5) {
                if (idx >= 100) {
                    return new Error('Step 2')
                }
            }
            console.log(`[6/6]: Report ${user} was successfully!\n`)
            await handleScreenshot(page, false, user)
            return true
        } catch (e) {
            console.log(`Error! Report ${user} was failed!\n`)
            await handleScreenshot(page, true, `error_${user}`)
            return false
        }

    }

    const handleScreenshot = async (page, isError = false, txt = 'screenshot') => {
        if (isError && txt === 'screenshot') { txt = 'error'}
        await page.screenshot({path: `screens/${txt}.png`});
    }

    // await browser.close();

    const init = async () => {
        try {
            context = await browser.newContext({storageState: 'state.json'});
            const page = await context.newPage();

            const url = 'https://www.instagram.com/accounts/edit/'

            console.log('[1/4]: GOTO...')
            await page.goto(url)
            console.log('[2/4]: GOTO LOADING...')
            await page.waitForSelector('button[type=button]')
            console.log('[3/4]: Goto success...')

            let btn = (await page.$$('nav span'))[1]
            await btn.click()
            btn = (await page.$$('nav a'))[5]
            const user = (await btn.getAttribute('href')).split('/')[1]

            console.log(`[4/4]: Login successfully as ${user}`)
            // await handleScreenshot(page)
            return true
        } catch (e) {
            console.log(`Login failed! Try again or usage: app login <login> <password>`)
            return false
        }
    }

    const close = async () => {
        try {
            await browser.close()
            return true
        } catch (e) {
            return false
        }
    }

    return {
        login: handleLogin,
        reportPage: handleReportPage,
        screenshot: handleScreenshot,
        init,
        close,
    }
};

module.exports = AIR
