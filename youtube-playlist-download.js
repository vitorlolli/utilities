import ytpl from 'ytpl'
import fs from 'fs'
import path from 'path'
import ytdl from 'ytdl-core'
import slugify from 'slugify'
import ora from 'ora'
import process from 'process'
import chalk from 'chalk'
import prettyMilliseconds from 'pretty-ms'
import prettyBytes from 'pretty-bytes'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

ffmpeg.setFfmpegPath(ffmpegPath.path)

const convertToMp3 = (videoPath, mp3Path) => new Promise(async (resolve, reject) => {
    ffmpeg({ source: videoPath })
        .saveToFile(mp3Path)
        .on('end', function (err) {
            if (!err) {
                resolve()
            }
            else {
                reject()
            }
        })
        .on('error', err => {
            console.log('error: ', err)
            reject()
        })
        .run()
})

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

const videoDownload = (dir, id) => new Promise(async (resolve, reject) => {
    let { videoDetails } = await ytdl.getInfo(id)
    const { title, video_url } = videoDetails
    const content_path = path.resolve(dir, `${slugify(title, { replacement: '_', lower: true })}.mp4`)
    ytdl(video_url, { quality: 'highest', filter: 'audioandvideo' })
        .pipe(fs.createWriteStream(content_path))
        .on("finish", async () => {
            resolve(content_path)
        })
        .on("error", (error) => {
            reject(error)
        })
})
const spinnerPlaylist = ora('Getting videos Ids').start()
const videos_ids = await getYoutubePlaylistVideosIds('PLHJJa8p-g9sMYUjL_4YB8c5uOKOicquDB')
spinnerPlaylist.text = `${videos_ids.length} videos found`
spinnerPlaylist.succeed()

console.log('')

const onlyAudio = true

for (let index = 0; index < videos_ids.length; index++) {
    const video_id = videos_ids[index]
    const label = `${String(index + 1).padStart(String(videos_ids.length).length, "0")}/${videos_ids.length}`
    const start_time = process.hrtime()
    const spinner = ora(`${label} downloading`).start()
    const video_path = await videoDownload('./musicas', video_id)
    spinner.text = `${label} download success`
    let final_file = video_path
    if (onlyAudio) {
        const path_info = path.parse(video_path)
        const mp3_path = path.resolve(path_info.dir, `${path_info.name}.mp3`)
        spinner.text = `${label} converting`
        await convertToMp3(video_path, mp3_path)
        final_file = mp3_path
        // fs.unlinkSync(video_path)
    }
    const file_size = prettyBytes(fs.statSync(final_file).size)
    const end_time = process.hrtime(start_time)
    const pretty_time = prettyMilliseconds(end_time[0] * 1000 + end_time[1] / 1000000)
    spinner.text = `${label} success`
    spinner.suffixText = chalk.blue(`${pretty_time} | ${file_size}`)
    spinner.succeed()
}

console.log('')

console.log(chalk.green('finish'))