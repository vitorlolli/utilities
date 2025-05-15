import fs from 'fs'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

puppeteer.use(StealthPlugin())

const sleep = async ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

const waitForDownload = async downloadPath => new Promise((resolve, reject) => {
    const timeout = 30000
    const start = Date.now()

    const interval = setInterval(() => {
        const files = fs.readdirSync(downloadPath)
        const stillDownloading = files.some(f => f.endsWith('.crdownload'))

        if (!stillDownloading && files.length > 0) {
            clearInterval(interval)
            resolve()
        }

        if (Date.now() - start > timeout) {
            clearInterval(interval)
            reject(new Error('Tempo excedido esperando o download.'))
        }
    }, 500)
})

const sites = JSON.parse(fs.readFileSync('./sites.json').toString())

const downloadPath = path.resolve(__dirname, 'downloads')

const proccess = async (sites, stages) => {
    for (let index = 0; index < sites.length; index++) {
        const site = sites[index]

        let browser, page

        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-features=BlockInsecurePrivateNetworkRequests',
                '--ignore-certificate-errors',
                '--start-maximized',
                '--disable-extensions',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=site-per-process',
                '--disable-web-security'
            ]
        })

        page = await browser.newPage()

        const { width, height } = await page.evaluate(() => {
            return { width: window.screen.width, height: window.screen.height }
        })

        await page.setViewport({ width, height })

        await browser.setCookie({
            name: 'cookie_consent',
            value: 'true',
            domain: site.url
        })

        await page.goto(site.wordpress.login_url)

        await sleep(5000)

        await page.type('#user_login', site.wordpress.login)
        await page.type('#user_pass', site.wordpress.senha)

        await page.click('#wp-submit')

        await sleep(5000)

        if (stages.includes('backup')) {
            // backup 1  
            // console.log('backup1')

            // await page.click('#wp-admin-bar-wp-logo')

            // await sleep(5000)

            // await page.setRequestInterception(true)

            // page.on('request', (request) => {
            //     if (request.url().includes('adblock') || request.url().includes('blocked')) {
            //         request.abort()
            //     } else {
            //         request.continue()
            //     }
            // })

            // page.on('dialog', async dialog => {
            //     console.log('Diálogo detectado:', dialog.message())
            //     await dialog.accept()
            //     await sleep(5000)
            // })

            // await page.click('#toplevel_page_WPvivid')

            // await sleep(5000)

            // let hasRows = await page.evaluate(() => {
            //     const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
            //     return tbody && tbody.querySelector('tr') !== null
            // })

            // while (hasRows) {
            //     await page.click('#wpvivid_backup_list > tr > td:nth-child(6) > div > img')

            //     await sleep(5000)

            //     hasRows = await page.evaluate(() => {
            //         const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
            //         return tbody && tbody.querySelector('tr') !== null
            //     })
            // }

            // await sleep(5000)

            // await page.click('#wpvivid_quickbackup_btn')

            // hasRows = await page.evaluate(() => {
            //     const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
            //     return tbody && tbody.querySelector('tr') !== null
            // })

            // while (!hasRows) {
            //     await sleep(5000)
            //     hasRows = await page.evaluate(() => {
            //         const tbody = document.querySelector('#wpvivid_backuplist_table tbody')
            //         return tbody && tbody.querySelector('tr') !== null
            //     })
            // }

            // const table = await page.$('#wpvivid_backuplist_table')

            // await table.screenshot({ path: `./prints/${site.nome}_1_BACKUP_1.png` })

            // backup 2

            // console.log('backup2')

            // await page.goto(site.url)

            // await sleep(5000)

            // await page.screenshot({ path: `./prints/${site.nome}_1_BACKUP_2.png` })

            // console.log('download backup')

            await page.click('#wp-admin-bar-wp-logo')

            await sleep(5000)

            await page.click('#toplevel_page_WPvivid')

            await sleep(5000)

            const rows = await page.$$('#wpvivid_backuplist_table tbody tr')
            if (rows.length > 0) {
                const downloadButton = await rows[0].$('td:nth-child(4) div[onclick*="wpvivid_initialize_download"]')
                if (downloadButton) {
                    await downloadButton.click()

                    await sleep(5000)

                    const client = await page.createCDPSession()
                    await client.send('Page.setDownloadBehavior', {
                        behavior: 'allow',
                        downloadPath: downloadPath,                    
                    })

                    const downloadLinks = await page.$$('.wpvivid-ready-download a')

                    for (let i = 0; i < downloadLinks.length; i++) {
                        const link = downloadLinks[i]
                        await link.click()
                        await sleep(1000)
                        await waitForDownload(downloadPath)
                        await sleep(2000)
                    }
                }
            }
        }

        if (stages.includes('plugins')) {
            // plugins
            console.log('plugins')
            await page.click('#wp-admin-bar-wp-logo')

            await sleep(5000)

            let checkUpdate = await page.$('#wp-admin-bar-updates')
            if (checkUpdate) {
                await page.click('#wp-admin-bar-updates')

                await sleep(10000)

                const plugins_nomes = []
                let plugins = await page.$$('#update-plugins-table > tbody > tr > td.plugin-title > p > strong')
                for (let index = 0; index < plugins.length; index++) {
                    const element = plugins[index]
                    const texto = await page.evaluate(el => el.innerText.trim(), element)
                    plugins_nomes.push(texto)
                }

                for (let index = 0; index < plugins_nomes.length; index++) {
                    const nome = plugins_nomes[index]
                    const trElemento = await page.evaluateHandle((nome) => {
                        return Array.from(document.querySelectorAll('#update-plugins-table > tbody > tr'))
                            .find(tr => {
                                const strongElement = tr.querySelector('td.plugin-title > p > strong')
                                return strongElement && strongElement.innerText.trim() === nome
                            })
                    }, nome)

                    if (trElemento) {
                        const checkColumn = await trElemento.$('td.check-column')
                        if (checkColumn) {
                            await checkColumn.click()
                            await page.click('#upgrade-plugins')
                            await sleep(30000)

                            checkUpdate = await page.$('#wp-admin-bar-updates')
                            if (checkUpdate) {
                                await page.click('#wp-admin-bar-updates')
                                await sleep(3000)
                            }
                        }
                    }
                }
            }

            // ativa wordfense
            await page.click('#menu-plugins')

            await sleep(5000)

            const check_wordfense = await page.$('#activate-wordfence')
            if (check_wordfense) {
                await page.click('#activate-wordfence')
                await sleep(5000)
            }

            await page.click('#wp-admin-bar-wp-logo')

            await sleep(5000)

            await page.click('#menu-plugins')

            await sleep(5000)

            const plugins_table = await page.$('.wp-list-table.widefat.plugins')
            await plugins_table.screenshot({ path: `./prints/${site.nome}_2_PLUGINS.png` })
        }

        if (stages.includes('plugins')) {
            await page.click('#wp-admin-bar-wp-logo')

            await sleep(5000)

            let checkUpdateTemas = await page.$('#wp-admin-bar-updates')
            if (checkUpdateTemas) {
                await page.click('#wp-admin-bar-updates')
                await sleep(10000)
                let selectAllButton = await page.$('#themes-select-all')
                if (selectAllButton) {
                    await page.click("#themes-select-all")
                    await sleep(2000)
                    let buttonUpdate = await page.$('#upgrade-themes')
                    if (buttonUpdate) {
                        await page.click("#upgrade-themes")
                        await sleep(10000)
                    }
                }
            }
        }

        if (stages.includes('usuarios')) {
            // usuarios
            console.log('usuarios')
            await page.click('#wp-admin-bar-wp-logo')

            await sleep(5000)

            await page.click('#menu-users')

            await sleep(5000)

            const users_table = await page.$('.wp-list-table.widefat.fixed.striped.table-view-list.users')
            await users_table.screenshot({ path: `./prints/${site.nome}_4_USUARIOS.png` })
        }

        if (stages.includes('varredura')) {
            // varredura  
            console.log('varredura')

            await page.evaluate(() => {
                window.onblur = null
                window.onfocus = null
            })

            await page.click('#wp-admin-bar-wp-logo')

            await sleep(5000)

            await page.click('#menu-plugins')

            await sleep(5000)

            const check_wordfense = await page.$('#activate-wordfence')
            if (check_wordfense) {
                await page.click('#activate-wordfence')
                await sleep(5000)
            }

            await page.goto(`${site.url}/wp-admin/admin.php?page=WordfenceScan`)

            await sleep(5000)

            await page.click('#wf-scan-starter > div > a.wf-btn.wf-btn-primary.wf-btn-callout-subtle.wf-scan-starter-idle')

            await sleep(5000)

            let varrendo = await page.$eval(
                '#wf-scan-starter > div > a.wf-btn.wf-btn-primary.wf-btn-callout-subtle.wf-scan-starter-idle',
                el => window.getComputedStyle(el).display === 'none'
            ).catch(() => false)

            while (varrendo) {
                varrendo = await page.$eval(
                    '#wf-scan-starter > div > a.wf-btn.wf-btn-primary.wf-btn-callout-subtle.wf-scan-starter-idle',
                    el => window.getComputedStyle(el).display === 'none'
                ).catch(() => false)
                await sleep(5000)
            }

            const scan_progress = await page.$('#wf-scan-progress-bar > ul')
            if (scan_progress) {
                await page.$eval('#wf-scan-progress-bar > ul', el => {
                    el.scrollLeft = el.scrollWidth
                })
                await scan_progress.screenshot({ path: `./prints/${site.nome}_3_VARREDURA.png` })
            }

        }

        if (stages.includes('bloqueios')) {
            // bloqueios
            console.log('bloqueios')
            await page.goto(`${site.url}/wp-admin/admin.php?page=Wordfence`)

            await sleep(5000)

            const bloqueios_table = await page.$('.wf-blocks-summary')
            if (bloqueios_table) {
                await bloqueios_table.screenshot({ path: `./prints/${site.nome}_5_BLOQUEIOS.png` })
            }
        }

        //await browser.close()
    }

}

// ['backup', 'plugins', 'usuarios', 'varredura', 'bloqueios']
await proccess(
    sites.filter(site => ["BLOGKONTRIP"].includes(site.nome)),
    ['backup']
)

console.log('FIM')