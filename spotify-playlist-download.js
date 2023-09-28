import ora from "ora"
import path from 'path'
import { filenamifyPath } from 'filenamify'
import fs from 'fs'
import spotify from "./src/spotify.js"
import prettyBytes from "pretty-bytes"
import prettyMilliseconds from "pretty-ms"
import chalk from "chalk"

const url = 'https://open.spotify.com/playlist/0qy2kBHcu8FfuYdjxOpBQH'

const spinnerPlaylist = ora('Getting Musics').start()
const playlist_info = await spotify.getPlayListInfo(url)
const playlist_dir = path.resolve(path.basename(filenamifyPath(playlist_info.name)))
if (!fs.existsSync(playlist_dir)) {
    fs.mkdirSync(playlist_dir)
}

const musics = playlist_info.musics
spinnerPlaylist.text = `Playlist "${playlist_info.name}" - ${musics.length} musics found`
spinnerPlaylist.succeed()

console.log('')

for (let index = 0; index < musics.length; index++) {
    const music = musics[index]
    const label = `${String(index + 1).padStart(String(musics.length).length, "0")}/${musics.length}`
    const start_time = process.hrtime()
    const spinner = ora(`${label} downloading`).start()
    let music_path = path.resolve(playlist_dir, path.basename(filenamifyPath(`${music.name}.mp3`)))
    if (!fs.existsSync(music_path)) {
        music_path = await spotify.musicDownload({ url: music.url, dir: playlist_dir })
    }
    spinner.text = `${label} download success`
    let final_file = music_path
    const file_size = prettyBytes(fs.statSync(final_file).size)
    const end_time = process.hrtime(start_time)
    const pretty_time = prettyMilliseconds(end_time[0] * 1000 + end_time[1] / 1000000)
    spinner.text = `${label} success`
    spinner.suffixText = chalk.blue(`${pretty_time} | ${file_size}`)
    spinner.succeed()
}

console.log('')

console.log(chalk.green('finish'))