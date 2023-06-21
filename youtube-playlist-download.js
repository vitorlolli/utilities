import ytpl from 'ytpl'
import fs from 'fs'
import ytdl from 'ytdl-core'
import slugify from 'slugify'

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

const videos_ids = await getYoutubePlaylistVideosIds('PLoCBG2v7-txh2Mxi0SYaka76lu44hrBMf')
console.log(`${videos_ids.length} videos`)
console.log('downloading')
for (let index = 0; index < videos_ids.length; index++) {
    const video_id = videos_ids[index]
    const label = `${index + 1}/${videos_ids.length}`
    console.time(label)
    await videoDownload(video_id)
    console.timeEnd(label)
}
console.log('finish')