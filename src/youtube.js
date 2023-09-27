import fs from 'fs'
import path from 'path'
import ytdl from 'ytdl-core'
import { filenamifyPath } from 'filenamify'
import ytpl from 'ytpl'

const videoDownload = ({ id, dir = path.resolve(), audioOnly = false }) => new Promise(async (resolve, reject) => {
    let { videoDetails } = await ytdl.getInfo(id)
    const { title, video_url } = videoDetails
    const ext = !audioOnly ? 'mp4' : 'mp3'
    const file_name = path.basename(filenamifyPath(`${title}.${ext}`))
    const content_path = path.resolve(dir, file_name)
    ytdl(video_url, { quality: 'highest', filter: !audioOnly ? 'audioandvideo' : 'audioonly' })
        .pipe(fs.createWriteStream(content_path))
        .on("finish", async () => {
            resolve(content_path)
        })
        .on("error", (error) => {
            reject(error)
        })
})

const getPlaylistInfo = async playlist_id => {
    const ids = []
    let result = await ytpl(playlist_id, { pages: 1 })
    const info = {
        title: result.title
    }
    ids.push(...result.items.map(item => item.id))
    let continuation = result.continuation
    while (continuation) {
        const next = await ytpl.continueReq(continuation)
        ids.push(...next.items.map(item => item.id))
        continuation = next.continuation
    }
    return {
        ...info,
        videosId: ids
    }
}

export default {
    videoDownload,
    getPlaylistInfo
}