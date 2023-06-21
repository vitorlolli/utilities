import ytpl from 'ytpl'
import fs from 'fs'
import ytdl from 'ytdl-core'
import slugify from 'slugify'
import ora from 'ora'
import process from 'process'
import chalk from 'chalk'
import prettyMilliseconds from 'pretty-ms';

const getYoutubePlaylistVideosIds = async playlist_id => {
    const ids = []
    let result = await ytpl(playlist_id, { pages: 1 })
    ids.push(...result.items.map(item => item.id))
    let continuation = result.continuation
    while (continuation) {
        const next = await ytpl.continueReq(continuation)
        ids.push(...next.items.map(item => item.id))
        continuation = next.continuation
    }
    return ids
}

const videoDownload = id => new Promise(async (resolve, reject) => {
    let { videoDetails } = await ytdl.getInfo(id)
    const { title, video_url } = videoDetails
    const path = `./videos/${slugify(title, { replacement: '_', lower: true })}.mp4`
    ytdl(video_url, { quality: 'highest', filter: 'audioandvideo' })
        .pipe(fs.createWriteStream(path))
        .on("finish", async () => {
            resolve(path)
        })
        .on("error", (error) => {
            reject(error)
        })
})
const spinnerPlaylist = ora('Getting videos Ids').start()
const videos_ids = await getYoutubePlaylistVideosIds('PLoCBG2v7-txh2Mxi0SYaka76lu44hrBMf')
spinnerPlaylist.text = `${videos_ids.length} videos found`
spinnerPlaylist.succeed()

console.log('')

for (let index = 0; index < videos_ids.length; index++) {
    const video_id = videos_ids[index]
    const label = `${String(index + 1).padStart(String(videos_ids.length).length, "0")}/${videos_ids.length}`
    const start_time = process.hrtime()
    const spinner = ora(`${label} downloading`).start()    
    await videoDownload(video_id)
    const end_time = process.hrtime(start_time)
    const pretty_time = prettyMilliseconds(end_time[0] * 1000 + end_time[1] / 1000000)
    spinner.text = `${label} download success`
    spinner.suffixText = chalk.blue(pretty_time)
    spinner.succeed()
}

console.log('')

console.log('finish')