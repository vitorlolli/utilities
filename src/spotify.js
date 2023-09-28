import play from 'play-dl'
import path from 'path'
import SpottyDL from 'spottydl'

// esporádicamente requer autorização

const getPlayListInfo = async playlist_url => {
    const { name, fetched_tracks } = await play.spotify(playlist_url)
    return { name, musics: fetched_tracks.get('1').map(({ url, name }) => ({ url, name })) }
}

const musicDownload = async ({ url, dir = path.resolve() }) => {
    const results = await SpottyDL.getTrack(url)
    const track = await SpottyDL.downloadTrack(results, dir)
    let res = await SpottyDL.retryDownload(track)
    while (res != true) {
        res = await SpottyDL.retryDownload(res)
    }
    return track[0].filename
}

export default {
    getPlayListInfo,
    musicDownload
}