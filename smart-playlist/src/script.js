import {SVD} from 'svd-js'

const clientId = '9e2d4dd8eba243c9a01de32cb6b428c6'
const params = new URLSearchParams(window.location.search)
const code = params.get('code')
let accessToken = ''

document.addEventListener('DOMContentLoaded', function() {
    const button1 = document.getElementById('submitSongs')
    const button2 = document.getElementById('submitPlaylist')

    if (button1) {
        button1.addEventListener('click', async () => {
            try {
                const song1Element = document.getElementById('songbox1')
                const song2Element = document.getElementById('songbox2')
                const songQuery1 = song1Element.value
                const songQuery2 = song2Element.value
                if (songQuery1 == null || songQuery1 == '') throw new Error('Must enter first song name');
                if (songQuery2 == null || songQuery2 == '') throw new Error('Must enter second song name');
                
                const songResult1 = await searchTrack(accessToken, songQuery1, 10)
                const songResult2 = await searchTrack(accessToken, songQuery2, 10)
                
                const trackID1 = songResult1['tracks']['items'][0]['id']
                const trackID2 = songResult2['tracks']['items'][0]['id']
                
                const track1 = await fetchTrack(accessToken, trackID1)
                const track2 = await fetchTrack(accessToken, trackID2)
                
                const audioFeaturesResult1 = await fetchAudioFeatures(accessToken, trackID1)
                const audioAnalysisResult1 = await fetchAudioAnalysis(accessToken, trackID1)
                const audioFeaturesResult2 = await fetchAudioFeatures(accessToken, trackID2)
                const audioAnalysisResult2 = await fetchAudioAnalysis(accessToken, trackID2)
                
                const trackDetails1 = await getTrackDetails(track1, audioFeaturesResult1, audioAnalysisResult1)
                const trackDetails2 = await getTrackDetails(track2, audioFeaturesResult2, audioAnalysisResult2)
                
                const audioSegments1 = audioAnalysisResult1['segments']
                const audioSegments2 = audioAnalysisResult2['segments']
                const endSegments = weightedSegmentList(audioSegments1, 'end', 20)
                const beginningSegments = weightedSegmentList(audioSegments2, 'start', 20)
                
                const endSegmentsBestFit = bestFitLines(endSegments)
                const beginningSegmentsBestFit = bestFitLines(beginningSegments)
                
                const transitionScore = getTransitionScore(trackDetails1, trackDetails2, endSegmentsBestFit, beginningSegmentsBestFit)
                
                console.log(trackDetails1)
                console.log(trackDetails2)
                console.log(beginningSegments)
                console.log(endSegments)
                console.log(transitionScore)
            } catch (error) {
                // resultDiv.innerHTML = `Error: ${error.message}`
                alert(error.message)
                // console.log(error.message)
            }
        })
    }
    
    if (button2) {
        button2.addEventListener('click', async () => {
            console.log('button clicked')
            try {
                const playlistElement = document.getElementById('playlistName')
                const playlistQuery = playlistElement.value
                if (playlistQuery == null || playlistQuery == '') throw new Error('Must enter playlist name');
                
                const playlistSearchResult = await searchPlaylist(accessToken, playlistQuery, 10)
                const playlist = playlistSearchResult['playlists']['items'][0]
                const playlistID = playlist['id']
                const playlistTracksURL = playlist['tracks']['href']
                const playlistTracksResult = await fetchPlaylistTracks(accessToken, playlistTracksURL)
                
                let playlistTracks = []
                for (let i = 0; i < playlistTracksResult['items'].length; i++) {
                    playlistTracks.push(playlistTracksResult['items'][i]['track'])
                }

                const n = playlistTracks.length

                let playlistTrackNames = []
                let playlistTrackIDs = []
                for (let i = 0; i < n; i++) {
                    playlistTrackNames.push(playlistTracks[i]['name'])
                    playlistTrackIDs.push(playlistTracks[i]['id'])
                }

                // get all audio features
                const playlistAudioFeaturesResult = await fetchMultipleAudioFeatures(accessToken, playlistTrackIDs)
                const playlistAudioFeatures = playlistAudioFeaturesResult['audio_features']
                
                // create transitionScoreMatrix
                const simMat = similarityMatrix(playlistAudioFeatures)

                // sort playlist for high similarity with adjacent songs
                const sortedPlaylistIndices = sortPlaylistBySimilarity(simMat)

                // get sorted track names
                let sortedPlaylist = []
                for (let i = 0; i < n; i++) {
                    sortedPlaylist.push(playlistTrackNames[sortedPlaylistIndices['songOrder'][i]])
                }

                // reorder playlist
                let shift = 0
                for (let i = 0; i < n; i++) {
                    let range_start = sortedPlaylistIndices['songOrder'][i]
                    if (range_start < i) range_start += shift
                    let insert_before = i
                    if (range_start == insert_before) continue // avoid unnecessary API call
                    shift += 1

                    // let songName = sortedPlaylist[i]
                    // console.log('moving ' + songName + ' from index ' + range_start + ' to index ' + insert_before)

                    reorderPlaylist(accessToken, playlistID, range_start, insert_before, 1)
                }

                console.log('original order:')
                console.log(playlistTrackNames)
                console.log('new order:')
                console.log(sortedPlaylist)
            } catch (error) {
                // resultDiv.innerHTML = `Error: ${error.message}`
                alert(error.message)
                // console.log(error.message)
            }
        })
    } else {
        console.log('button not found')
    }
})

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage with async/await
async function executeAfterWait(time_ms) {
    // console.log('Waiting for 2 seconds...');
    await wait(time_ms);
    // console.log('This message is displayed after 2 seconds');
}

if (!code) {
    redirectToAuthCodeFlow(clientId)
} else {
    // const accessToken = await getAccessToken(clientId, code)
    accessToken = await getAccessToken(clientId, code)
    const profile = await fetchProfile(accessToken)
    // console.log(profile) // Profile data logs to console
    // populateUI(profile)
}
    
export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128)
    const challenge = await generateCodeChallenge(verifier)

    localStorage.setItem('verifier', verifier)

    const params = new URLSearchParams()
    params.append('client_id', clientId)
    params.append('response_type', 'code')
    params.append('redirect_uri', 'http://localhost:5173/callback')
    params.append('scope', 'user-read-private user-read-email playlist-modify-public playlist-modify-private')
    params.append('code_challenge_method', 'S256')
    params.append('code_challenge', challenge)

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`
}

function generateCodeVerifier(length) {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem('verifier')

    const params = new URLSearchParams()
    params.append('client_id', clientId)
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', 'http://localhost:5173/callback')
    params.append('code_verifier', verifier)

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })

    const { access_token } = await result.json()
    return access_token
}

async function fetchProfile(token) {
    const result = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

function populateUI(profile) {
    document.getElementById('displayName').innerText = profile.display_name
    // if (profile.images[0]) {
    //     const profileImage = new Image(200, 200)
    //     profileImage.src = profile.images[0].url
    //     document.getElementById('avatar').appendChild(profileImage)
    //     document.getElementById('imgUrl').innerText = profile.images[0].url
    // }
    // document.getElementById('id').innerText = profile.id
    // document.getElementById('email').innerText = profile.email
    // document.getElementById('uri').innerText = profile.uri
    // document.getElementById('uri').setAttribute('href', profile.external_urls.spotify)
    // document.getElementById('url').innerText = profile.href
    // document.getElementById('url').setAttribute('href', profile.href)
}

async function searchTrack(token, query, limit) {
    let urlEncodedQuery = 'https://api.spotify.com/v1/search?q=' + query.replace(' ', '+') + '&type=track&limit=' + limit
    const result = await fetch(urlEncodedQuery, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function searchPlaylist(token, query, limit) {
    let urlEncodedQuery = 'https://api.spotify.com/v1/search?q=' + query.replace(' ', '+') + '&type=playlist&limit=' + limit
    const result = await fetch(urlEncodedQuery, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchTrack(token, songID) {
    const result = await fetch('https://api.spotify.com/v1/tracks/' + songID, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchPlaylist(token, id) {
    const result = await fetch('https://api.spotify.com/v1/playlists/' + id, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchUserPlaylists(token, limit) {
    const result = await fetch('https://api.spotify.com/v1/me/playlists?limit=' + limit, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchPlaylistTracks(token, url) {
    const result = await fetch(url, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchAudioFeatures(token, songID) {
    const result = await fetch('https://api.spotify.com/v1/audio-features/' + songID, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchMultipleAudioFeatures(token, songIDs) {
    let query = 'https://api.spotify.com/v1/audio-features?ids='
    for (let i = 0; i < songIDs.length; i++) {
        query += songIDs[i]
        if (i != songIDs.length - 1) query += ','
    }

    const result = await fetch(query, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchAudioAnalysis(token, songID) {
    const result = await fetch('https://api.spotify.com/v1/audio-analysis/' + songID, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchRecommendations(token, songID, limit) {
    const result = await fetch('https://api.spotify.com/v1/recommendations?' + 
                                'limit=' + limit +
                                '&seed_tracks=' + songID, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function fetchFilteredRecommendations(token, songID, acousticness, danceability, energy, instrumentalness, maxLiveness, valence, limit) {
    const result = await fetch('https://api.spotify.com/v1/recommendations?' + 
                                'limit=' + limit +
                                '&seed_tracks=' + songID + 
                                '&target_acousticness=' + acousticness +
                                '&target_danceability=' + danceability +
                                '&target_energy=' + energy +
                                '&target_instrumentalness=' + instrumentalness +
                                '&max_liveness=' + maxLiveness +
                                '&target_valence=' + valence, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}

async function getTrackDetails(track, audioFeaturesResult, audioAnalysisResult) {
    return {name: track['name'],
            artist: track['artists'][0]['name'],
            duration: audioAnalysisResult['track']['duration'],
            end_of_fade_in: audioAnalysisResult['track']['end_of_fade_in'],
            start_of_fade_out: audioAnalysisResult['track']['start_of_fade_out'],
            acousticness: audioFeaturesResult['acousticness'],
            danceability: audioFeaturesResult['danceability'],
            energy: audioFeaturesResult['energy'],
            instrumentalness: audioFeaturesResult['instrumentalness'],
            key: audioFeaturesResult['key'],
            liveness: audioFeaturesResult['liveness'],
            loudness: audioFeaturesResult['loudness'],
            mode: audioFeaturesResult['mode'],
            tempo: audioFeaturesResult['tempo'],
            time_signature: audioFeaturesResult['time_signature'],
            valence: audioFeaturesResult['valence']
    }
}

async function reorderPlaylist(token, playlistID, range_start, insert_before, range_length) {
    const method = 'PUT'
    const headers = {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}
    const data = '{"range_start":' +  range_start + ', "insert_before":' + insert_before + ', "range_length":' + range_length + '}'

    const result = await fetch('https://api.spotify.com/v1/playlists/' + playlistID + '/tracks', {
        method: method, headers: headers, body: data
    })

    return await result.json()
}

function weightedSegment(d, p, t) {
    const pitchWeight = 1
    const timbreWeight = 1
    this.duration = d
    this.pitches = p
    this.timbre = t
    this.pitchesWeighted = this.pitches.map(number => number * pitchWeight);
    this.timbreWeighted = this.timbre.map(number => number * timbreWeight);
}

function weightedSegmentList(audioSegments, index, segmentCount) {
    let time = 0
    let graph = []

    if (index == "start") {
        // iterate forward from index 0
        let i = 0
        while (true) {
            time += audioSegments[i]['duration']
            const d = audioSegments[i]['duration']
            const p = audioSegments[i]['pitches']
            const t = audioSegments[i]['timbre']
            let ws = new weightedSegment(d, p, t)

            // push adds element to back of list
            graph.push(ws)

            if (graph.length == segmentCount) break

            i += 1
        }
    } else if (index == "end") {
        // iterate backward from last index
        let i = -1
        while (true) {
            time += audioSegments.at(i)['duration']
            const d = audioSegments.at(i)['duration']
            const p = audioSegments.at(i)['pitches']
            const t = audioSegments.at(i)['timbre']
            let ws = new weightedSegment(d, p, t)

            // unshift add element to front of list
            graph.unshift(ws)

            if (graph.length == segmentCount) break

            i -= 1
        }
    } else {
        console.log("Invalid segment index")
    }

    return {graph, time}
}

function bestFitLines(weightedSegmentList) {
    const graph = weightedSegmentList['graph']
    const duration = weightedSegmentList['time']
    const n = graph.length

    if (n === 0) {
        throw new Error("No data points provided");
    }

    // grab weighted pitches and timbres
    let pitchMatrix = []
    let timbreMatrix = []
    for (let i = 0; i < n; i++) {
        pitchMatrix.push(graph[i].pitchesWeighted)
        timbreMatrix.push(graph[i].timbreWeighted)
    }

    // find min and max values for each channel
    let minPitch = []
    let maxPitch = []
    let minTimbre = []
    let maxTimbre = []
    for (let i = 0; i < n; i++) {
        let minPitchVal = 1000000
        let maxPitchVal = -1000000
        let minTimbreVal = 1000000
        let maxTimbreVal = -1000000
        for (let j = 0; j < 12; j++) {
            if (graph[j].pitchesWeighted[i] < minPitchVal) minPitchVal = graph[j].pitchesWeighted[i]
            if (graph[j].pitchesWeighted[i] > maxPitchVal) maxPitchVal = graph[j].pitchesWeighted[i]
            if (graph[j].timbreWeighted[i] < minTimbreVal) minTimbreVal = graph[j].timbreWeighted[i]
            if (graph[j].timbreWeighted[i] > maxTimbreVal) maxTimbreVal = graph[j].timbreWeighted[i]
        }
        minPitch.push(minPitchVal)
        maxPitch.push(maxPitchVal)
        minTimbre.push(minTimbreVal)
        maxTimbre.push(maxTimbreVal)
    }

    // find range of data
    let pitchRangeSum = 0
    let timbreRangeSum = 0
    for (let i = 0; i < 12; i++) {
        pitchRangeSum += (maxPitch[i] - minPitch[i]) ** 2
        timbreRangeSum += (maxTimbre[i] - minTimbre[i]) ** 2
    }
    const pitchRange = Math.sqrt(pitchRangeSum)
    const timbreRange = Math.sqrt(timbreRangeSum)
    
    // create mean arrays
    let pitchMatrixMean = []
    let timbreMatrixMean = []
    for (let i = 0; i < n; i++) {
        pitchMatrixMean.push(0)
        timbreMatrixMean.push(0)

        let tempPitchSum = 0
        let tempTimbreSum = 0
        for (let j = 0; j < 12; j++) {
            tempPitchSum += graph[j].pitchesWeighted[i]
            tempTimbreSum += graph[j].timbreWeighted[i]
        }

        pitchMatrixMean[i] = tempPitchSum / 12
        timbreMatrixMean[i] = tempTimbreSum / 12
    }

    // adjust matrices to respective means
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < 12; j++) {
            pitchMatrix[i][j] -= pitchMatrixMean[j]
            timbreMatrix[i][j] -= timbreMatrixMean[j]
        }
    }
   
    // calculate SVD
    const pitchSVD = SVD(pitchMatrix)
    const timbreSVD = SVD(timbreMatrix)

    // create line centered on origin
    let pitchPoint1 = []
    let pitchPoint2 = []
    let timbrePoint1 = []
    let timbrePoint2 = []
    for (let i = 0; i < 12; i++) {
        pitchPoint1.push((pitchSVD['q'][i] * (-pitchRange / 2)) + pitchMatrixMean[i])
        pitchPoint2.push((pitchSVD['q'][i] * (pitchRange / 2)) + pitchMatrixMean[i])
        timbrePoint1.push((timbreSVD['q'][i] * (-timbreRange / 2)) + timbreMatrixMean[i])
        timbrePoint2.push((timbreSVD['q'][i] * (timbreRange / 2)) + timbreMatrixMean[i])
    }

    // get slope
    // (y2 - y1) / (x2 - x1)
    let pitchSlope = []
    let timbreSlope = []
    for (let i = 0; i < 12; i++) {
        pitchSlope.push((pitchPoint2[i] - pitchPoint1[i]) / duration)
        timbreSlope.push((timbrePoint2[i] - timbrePoint1[i]) / duration)
    }
    // console.log(pitchSlope, timbreSlope)

    // get intercept
    // y = mx + b
    // b = y - mx
    let pitchIntercept = []
    let timbreIntercept = []
    for (let i = 0; i < 12; i++) {
        pitchIntercept.push(graph[0].pitchesWeighted[i] - (pitchSlope[i] * graph[0].duration))
        timbreIntercept.push(graph[0].timbreWeighted[i] - (timbreSlope[i] * graph[0].duration))
    }
    // console.log(pitchIntercept, timbreIntercept)

    return {pitchSlope, pitchIntercept, timbreSlope, timbreIntercept, duration}
}

function getSimilarityScore(audioFeatures1, audioFeatures2) {
    let score = 0

    // key change
    let keyDiff = Math.abs(audioFeatures1['key'] - audioFeatures2['key'])
    if (keyDiff == 0) {
        score += 0
    } else if (keyDiff == 4 || keyDiff == 5 || keyDiff == 7) {
        // third, fourth, or fifth
        score += 1
    } else {
        score += 2
    }
    
    score += Math.abs(keyDiff)
    score += Math.abs(audioFeatures1['acousticness'] - audioFeatures2['acousticness'])
    score += Math.abs(audioFeatures1['danceability'] - audioFeatures2['danceability'])
    score += Math.abs(audioFeatures1['energy'] - audioFeatures2['energy'])
    // score += Math.abs(audioFeatures1['instrumentalness'] - audioFeatures2['instrumentalness'])
    // score += Math.abs(audioFeatures1['liveness'] - audioFeatures2['liveness'])
    score += Math.abs(audioFeatures1['loudness'] - audioFeatures2['loudness']) * 2
    // score += Math.abs(audioFeatures1['valence'] - audioFeatures2['valence'])

    return {score}
}

function getTransitionScore(trackDetails1, trackDetails2, bestFitLine1, bestFitLine2) {
    // compare 12-dimensional pitch curve and 12-dimensional timbre curve
    // lower value = better transition
    let pitchScore = 0
    let timbreScore = 0
    for (let i = 0; i < 12; i++) {
        // pitchScore += bestFitLine2['pitchSlope'][i] - bestFitLine1['pitchSlope'][i]
        pitchScore += (bestFitLine2['pitchIntercept'][i] - (bestFitLine1['pitchIntercept'][i] + (bestFitLine1['pitchSlope'][i] * bestFitLine1['duration']))) ** 2
        // timbreScore += bestFitLine2['timbreSlope'][i] - bestFitLine1['timbreSlope'][i]
        timbreScore += (bestFitLine2['timbreIntercept'][i] - (bestFitLine1['timbreIntercept'][i] + (bestFitLine1['timbreSlope'][i] * bestFitLine1['duration']))) ** 2
    }
    pitchScore = Math.sqrt(pitchScore)
    timbreScore = Math.sqrt(timbreScore)

    let metaScore = 0

    // key change
    let keyDiff = Math.abs(trackDetails1.key - trackDetails2.key)
    if (keyDiff == 0) {
        metaScore += 0
    } else if (keyDiff == 4 || keyDiff == 5 || keyDiff == 7) {
        // third, fourth, or fifth
        metaScore += 1
    } else {
        metaScore += 2
    }
    
    metaScore += Math.abs(keyDiff)
    metaScore += Math.abs(trackDetails1.acousticness - trackDetails2.acousticness)
    metaScore += Math.abs(trackDetails1.danceability - trackDetails2.danceability)
    metaScore += Math.abs(trackDetails1.energy - trackDetails2.energy)
    // metaScore += Math.abs(trackDetails1.instrumentalness - trackDetails2.instrumentalness)
    // metaScore += Math.abs(trackDetails1.liveness - trackDetails2.liveness)
    metaScore += Math.abs(trackDetails1.loudness - trackDetails2.loudness) * 2
    // metaScore += Math.abs(trackDetails1.valence - trackDetails2.valence)

    let metaPitchScore = Math.abs(metaScore * pitchScore)

    return {pitchScore, timbreScore, metaScore, metaPitchScore}
}

function similarityMatrix(playlistAudioFeatures) {
    const n = playlistAudioFeatures.length

    let mat = []
    for (let i = 0; i < n; i++) {
        let row = []
        for (let j = 0; j < n; j++) {
            if (j == i) row.push(Infinity)
            else row.push(getSimilarityScore(playlistAudioFeatures[i], playlistAudioFeatures[j])['score'])
        }
        mat.push(row)
    }

    return mat
}

function sortPlaylistBySimilarity(simMat) {
    const n = simMat.length
    let simimlaritySum = 0
    let score = 0

    let songUsed = []
    for (let i = 0; i < n; i++) {
        songUsed.push(0)
    }

    let i = 0
    let count = 0
    let songOrder = []
    while (true) {
        count += 1

        let tempMinVal = 1000000
        let tempMinIndex = 0

        for (let j = 0; j < n; j++) {
            if (i == j) continue
            if (!songUsed[j] && simMat[i][j] < tempMinVal) {
                tempMinVal = simMat[i][j]
                tempMinIndex = j
                simimlaritySum += simMat[i][j]
            }
        }
        
        songOrder.push(i)
        songUsed[i] = 1
        i = tempMinIndex

        if (count == n) break
    }
    score = simimlaritySum / n

    return {songOrder, score}
}
