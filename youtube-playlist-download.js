import fs from 'fs'
import ora from 'ora'
import process from 'process'
import chalk from 'chalk'
import prettyMilliseconds from 'pretty-ms'
import prettyBytes from 'pretty-bytes'
import { filenamifyPath } from 'filenamify'
import path from 'path'

import youtube from "./src/youtube.js"

const spinnerPlaylist = ora('Getting videos Ids').start()
const playlist_info = await youtube.getPlaylistInfo('PL8_BclP632-JPWueg3THhGUmLyse9OJhh')
const playlist_dir = path.resolve(path.basename(filenamifyPath(playlist_info.title)))
if (!fs.existsSync(playlist_dir)) {
    fs.mkdirSync(playlist_dir)
}
const videos_ids = playlist_info.videosId
spinnerPlaylist.text = `Playlist "${playlist_info.title}" - ${videos_ids.length} videos found`
spinnerPlaylist.succeed()

console.log('')

const audioOnly = false

for (let index = 0; index < videos_ids.length; index++) {
    const video_id = videos_ids[index]
    const label = `${String(index + 1).padStart(String(videos_ids.length).length, "0")}/${videos_ids.length}`
    const start_time = process.hrtime()
    const spinner = ora(`${label} downloading`).start()    
    const video_path = await youtube.videoDownload({ dir: playlist_dir, id: video_id, audioOnly })
    spinner.text = `${label} download success`
    let final_file = video_path
    const file_size = prettyBytes(fs.statSync(final_file).size)
    const end_time = process.hrtime(start_time)
    const pretty_time = prettyMilliseconds(end_time[0] * 1000 + end_time[1] / 1000000)
    spinner.text = `${label} success`
    spinner.suffixText = chalk.blue(`${pretty_time} | ${file_size}`)
    spinner.succeed()
}

console.log('')

console.log(chalk.green('finish'))