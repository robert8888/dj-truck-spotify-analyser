require("dotenv").config();

const app = require('express')();
const cors = require('cors')
const fetch = require("node-fetch");
const Spotify = require('spotify-web-api-node');
const spotifyApi = new Spotify();
const querystring = require("querystring");

const PORT = process.env.PORT || 80;

app.use(cors());

app.get("/", (req, res) =>{
    res.send("test")
})

app.get('/getbpm', async (req, res) =>{
    let {q: query, t: expectedDuration} = req.query;
    const token = await fetch("https://open.spotify.com/get_access_token").then(response => response.json()).then((json) =>{
        return json.accessToken;
    })

    spotifyApi.setAccessToken(token);

    query = querystring.unescape(query);
    query = query.replace(/-/g, "")

    const data = await spotifyApi.searchTracks(query);

    const response = {}
    for(let track of data.body.tracks.items){
        const features = await spotifyApi.getAudioAnalysisForTrack(track.id);
        //if(features.body.track.duration !== expectedDuration) continue;
        response.offset = features.body.bars[0].start;
        response.bpm = features.body.track.tempo;
        response.duration = features.body.track.duration;
    }

    res.json(response)
});


app.listen(PORT, () => {
    console.log(`Server run on port: ${PORT}`)
})