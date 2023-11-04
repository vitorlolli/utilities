
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import extractFrames from 'ffmpeg-extract-frames'

await extractFrames({
    ffmpegPath: ffmpegPath.path,
    input: './teste.mp4',
    output: './teste/frame-%d.png'
})