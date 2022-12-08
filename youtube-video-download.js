import fs from 'fs'
import ytdl from 'ytdl-core'
import slugify from 'slugify'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

ffmpeg.setFfmpegPath(ffmpegPath.path)

const videoDownload = (id) => new Promise(async (resolve, reject) => {
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

//const videoPath = await videoDownload('LU6yH8ppXX0')


//corta video
/*ffmpeg({ source: videoPath })
    .setStartTime('00:01:12.5')
    .output('video.mp4')
    .on('start', function (commandLine) {
        console.log('Processing')
    })
    .on('end', function (err) {
        if (!err) { console.log('conversion Done') }
    })
    .on('error', err => console.log('error: ', err))
    .run()*/

// converte video para audio
/*ffmpeg({ source: 'video.mp4' })
    .output('audio.mp3')
    .on('start', function (commandLine) {
        console.log('Processing')
    })
    .on('end', function (err) {
        if (!err) { console.log('conversion Done') }
    })
    .on('error', err => console.log('error: ', err))
    .run()*/