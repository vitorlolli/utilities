import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

ffmpeg.setFfmpegPath(ffmpegPath.path)

const videoPath = '/home/vitor/Área de Trabalho/LAB/utilities/The.Office.S03E22.720p.BluRay.x264.DUAL-WWW.BLUDV.TV.mkv'

// opção para ser compativel com o whatsapp
// .outputOptions([
    // '-ac 2'
// ])

ffmpeg({ source: videoPath })
    .setStartTime('00:11:48.3')
    .duration('12.5')
    .output('video.mp4')
    .outputOptions([
        '-ac 2'
    ])
    .on('start', function (commandLine) {
        console.log('Processing')
    })
    .on('end', function (err) {
        if (!err) { console.log('conversion Done') }
    })
    .on('error', err => console.log('error: ', err))
    .run()