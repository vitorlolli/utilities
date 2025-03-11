import fs from 'fs'
import puppeteer from 'puppeteer'

const sleep = async ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

const sites = JSON.parse(fs.readFileSync('./sites.json').toString())

for (let index = 0; index < sites.length; index++) {
    const site = sites[index]

    let browser, page

    browser = await puppeteer.launch({
        headless: false,
        args: ['--ignore-certificate-errors', '--start-maximized']
    })

    page = await browser.newPage()

    const { width, height } = await page.evaluate(() => {
        return { width: window.screen.width, height: window.screen.height }
    })

    await browser.close()

    // backup 1
    browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--ignore-certificate-errors', '--start-maximized']
    })

    page = await browser.newPage()

    await page.setViewport({ width, height })

    await page.setRequestInterception(true)

    page.on('request', (request) => {
        if (request.url().includes('adblock') || request.url().includes('blocked')) {
            request.abort()
        } else {
            request.continue()
        }
    })

    await page.goto(site.wordpress.login_url)

    page.on('dialog', async dialog => {
        console.log('Diálogo detectado:', dialog.message())
        await dialog.accept()
        await sleep(5000)
    })

    await sleep(5000)

    await page.type('#user_login', site.wordpress.login)
    await page.type('#user_pass', site.wordpress.senha)

    await page.click('#wp-submit')

    await sleep(5000)

    await page.click('#toplevel_page_WPvivid')

    await sleep(5000)

    let hasRows = await page.evaluate(() => {
        const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
        return tbody && tbody.querySelector('tr') !== null
    })

    while (hasRows) {
        await page.click('#wpvivid_backup_list > tr > td:nth-child(6) > div > img')

        await sleep(5000)

        hasRows = await page.evaluate(() => {
            const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
            return tbody && tbody.querySelector('tr') !== null
        })
    }

    await sleep(5000)

    await page.click('#wpvivid_quickbackup_btn')

    hasRows = await page.evaluate(() => {
        const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
        return tbody && tbody.querySelector('tr') !== null
    })

    while (!hasRows) {
        await sleep(5000)
        hasRows = await page.evaluate(() => {
            const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
            return tbody && tbody.querySelector('tr') !== null
        })
    }

    const table = await page.$('#wpvivid_backuplist_table')

    await table.screenshot({ path: `./prints/${site.nome}_1_BACKUP_1.png` })

    await browser.close()

    // backup 2
    browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--ignore-certificate-errors', '--start-maximized']
    })

    page = await browser.newPage()

    await page.setViewport({ width, height })

    await page.goto(site.url)

    await sleep(5000)

    await page.screenshot({ path: `./prints/${site.nome}_1_BACKUP_2.png` })

    await browser.close()

    // plugins
    browser = await puppeteer.launch({
        headless: false,
        args: ['--ignore-certificate-errors', '--start-maximized']
    })

    page = await browser.newPage()

    await page.setViewport({ width, height })

    await page.goto(site.wordpress.login_url)

    await sleep(5000)

    await page.type('#user_login', site.wordpress.login)
    await page.type('#user_pass', site.wordpress.senha)

    await page.click('#wp-submit')

    await sleep(5000)

    let checkUpdate = await page.$('#wp-admin-bar-updates')
    if (checkUpdate) {
        await page.click('#wp-admin-bar-updates')

        await sleep(10000)

        let checkUpdates = await page.evaluate(() => {
            const tbody = document.querySelector('#update-plugins-table tbody')
            return tbody && tbody.querySelector('tr') !== null
        })

        while (checkUpdates) {
            await page.click('#update-plugins-table > tbody > tr:nth-child(1) > td.check-column')
            await page.click('#upgrade-plugins')

            await sleep(30000)

            checkUpdate = await page.$('#wp-admin-bar-updates')
            if (checkUpdate) {
                await page.click('#wp-admin-bar-updates')

                await sleep(10000)

                checkUpdates = await page.evaluate(() => {
                    const tbody = document.querySelector('#update-plugins-table tbody')
                    return tbody && tbody.querySelector('tr') !== null
                })
            }
            else {
                checkUpdates = false
            }

        }

        let checkUpdatesThemes = await page.evaluate(() => {
            const tbody = document.querySelector('#update-themes-table tbody')
            return tbody && tbody.querySelector('tr') !== null
        })

        while (checkUpdatesThemes) {
            await page.click('#update-themes-table > tbody > tr > td.check-column')
            await page.click('#upgrade-themes')

            await sleep(30000)

            checkUpdate = await page.$('#wp-admin-bar-updates')
            if (checkUpdate) {
                await page.click('#wp-admin-bar-updates')

                await sleep(10000)

                checkUpdatesThemes = await page.evaluate(() => {
                    const tbody = document.querySelector('#update-themes-table tbody')
                    return tbody && tbody.querySelector('tr') !== null
                })
            }
            else {
                checkUpdatesThemes = false
            }            
        }

    }

    await page.click('#menu-plugins')

    await sleep(5000)

    const plugins_table = await page.$('.wp-list-table.widefat.plugins')
    await plugins_table.screenshot({ path: `./prints/${site.nome}_2_PLUGINS.png` })

    await browser.close()

    // varredura
    // browser = await puppeteer.launch({
    //     headless: false,
    //     args: ['--ignore-certificate-errors', '--start-maximized']
    // })

    // page = await browser.newPage()

    // await page.setViewport({ width, height })

    // await page.goto(site.wordpress.login_url)

    // await sleep(5000)

    // await page.type('#user_login', site.wordpress.login)
    // await page.type('#user_pass', site.wordpress.senha)

    // await page.click('#wp-submit')

    // await sleep(5000)

    // usuarios
    browser = await puppeteer.launch({
        headless: false,
        args: ['--ignore-certificate-errors', '--start-maximized']
    })

    page = await browser.newPage()

    await page.setViewport({ width, height })

    await page.goto(site.wordpress.login_url)

    await sleep(5000)

    await page.type('#user_login', site.wordpress.login)
    await page.type('#user_pass', site.wordpress.senha)

    await page.click('#wp-submit')

    await sleep(5000)

    await page.click('#menu-users')

    await sleep(5000)

    const users_table = await page.$('.wp-list-table.widefat.fixed.striped.table-view-list.users')
    await users_table.screenshot({ path: `./prints/${site.nome}_4_USUARIOS.png` })
}
