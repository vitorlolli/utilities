import fs from 'fs'
import ytdl from 'ytdl-core'
import slugify from 'slugify'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

ffmpeg.setFfmpegPath(ffmpegPath.path)

const videoDownload = id => new Promise(async (resolve, reject) => {
    let { videoDetails } = await ytdl.getInfo(id)
    const { title, video_url } = videoDetails
    const path = `./${slugify(title, '_')}.mp4`
    ytdl(video_url, { quality: 'highest', filter: 'audioandvideo' })
        .pipe(fs.createWriteStream(path))
        .on("finish", async () => {
            resolve(path)
        })
        .on("error", (error) => {
            reject(error)
        })
})

const videoPath = await videoDownload('xHCnrdf2NBI')