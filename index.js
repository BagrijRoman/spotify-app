require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const axios = require('axios');

const { generateRandomString } = require('./utils');

const PORT = 8888;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const app = express();

app.get('/', (req, res) => {
    res.send('Hello world!')
});

app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email';

    const queryParams = querystring.stringify({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state,
        scope,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/login-callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const tokenDataResponse = await axios({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            },
        });


        if (tokenDataResponse.status !==200) {
            res.send(tokenDataResponse);
            return;
        }

        const { access_token, token_type } = tokenDataResponse.data;

        const userDataResponse = await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me',
            headers: {
                Authorization: `${token_type} ${access_token}`,
            },
        });

        if (userDataResponse.status !== 200) {
            res.send(userDataResponse);
            return;
        }

        res.send(`
            <pre>
              ${JSON.stringify(userDataResponse.data, null, 2)}
            </pre>
        `);
    } catch (error) {
        res.send(error)
    }
});

app.get('refresh-token', async (req, res) => {
    const { refresh_token } = req.query;

    try {
        const response= await axios({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token,
            }),
            headers: {
                'content_type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            },
        });

        if (response.status === 200) {
            res.send(response.data)
        } else {
            res.send(response)
        }
    } catch (error) {
        res.send(error)
    }
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
});
