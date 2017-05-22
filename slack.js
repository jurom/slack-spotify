import _request from 'request-promise'
import dotenv from 'dotenv'
import {SpotifyApplicationClient} from 'spotify-application-client'
import * as playlists from './lyrics'

dotenv.config({path: '.env'})

const token = process.env.token
const mock = process.env.mock === 'true' ? true : false

const request = mock ? console.log : _request

if (!token) {
  throw new Error('No token specified in env')
}

const apiRoot = `https://slack.com/api`

const setStatus = (status_emoji = '', status_text = '') =>
  request({
    method: 'POST',
    uri: `${apiRoot}/users.profile.set?token=${token}&profile=${encodeURIComponent(JSON.stringify({status_text, status_emoji}))}`
  })

const getCurrentLyricLine = (playlist) => Promise.all([
  SpotifyApplicationClient.getTrackName(),
  SpotifyApplicationClient.getPlayerPositionInSeconds().then((_) => _ * 1000),
  SpotifyApplicationClient.getTrackDurationInMilliseconds(),
]).then(([trackName, current, total]) => {
  const song = playlist[trackName] || [[]]
  return song[Math.floor((current / total) * song.length)]
})

setInterval(() =>
  getCurrentLyricLine(playlists.hamilton)
    .then((line) => setStatus(...line))
    .catch((e) => console.error('Error: ' + e)
  ),10 * 1000)
