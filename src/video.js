import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { differenceInSeconds, setHours, setMinutes, setSeconds } from 'date-fns'

ffmpeg.setFfmpegPath(ffmpegPath.path)

const crop = ({ sourcePath, outputDir,  }) => {

}

const cropVideo = (videoPath, outputPath, startTime, endTime, options) => new Promise(async (resolve, reject) => {
    const date = new Date()

    const [startHour, startMinute, startSecond] = startTime.split(':')
    let startTimeDate = setHours(date, startHour)
    startTimeDate = setMinutes(startTimeDate, startMinute)
    startTimeDate = setSeconds(startTimeDate, startSecond)

    const [endHour, endMinute, endSecond] = endTime.split(':')
    let endTimeDate = setHours(date, endHour)
    endTimeDate = setMinutes(endTimeDate, endMinute)
    endTimeDate = setSeconds(endTimeDate, endSecond)

    const diffSeconds = differenceInSeconds(
        endTimeDate,
        startTimeDate
    )

    const outputOptions = []
    if (options.whatsAppPreview) {
        outputOptions.push('-ac 2')
    }

    ffmpeg({ source: videoPath })
        .setStartTime(startTime)
        .duration(diffSeconds)
        .output(outputPath)
        .outputOptions(outputOptions)
        .on('start', function (commandLine) {
            console.log('Processing')
        })
        .on('end', function (err) {
            if (!err) { 
                console.log('conversion Done') 
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