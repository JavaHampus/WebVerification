const express = require('express')
const { CLIENT, AUTH } = require('../../../config.json')
const fetch = require("node-fetch")
const FormData = require('form-data')

const router = express.Router()

router.get('/', (req, res) => {
    if(req.session.user) return res.redirect('/');
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT.CLIENT_ID}&redirect_uri=${encodeURIComponent(AUTH.AUTH_REDIRECT)}&response_type=code&scope=${AUTH.SCOPES.join('%20')}`)
});

router.get('/callback', async (req, res) => {
    const accessCode = req.query.code;
    if(!accessCode) return res.render('error', { errorMessage: "No access code was provided!"});

    const data = new FormData()
    data.append('client_id', CLIENT.CLIENT_ID);
    data.append('client_secret', CLIENT.CLIENT_SECRET);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', AUTH.AUTH_REDIRECT);
    data.append('scope', AUTH.SCOPES.join(' '));
    data.append('code', accessCode);

    const response = await fetch('https://discordapp.com/api/oauth2/token', {
        method: 'POST',
        body: data
    });

    const json = await response.json();

    const userResponse = await fetch(`https://discordapp.com/api/users/@me`, {
        headers: {
            Authorization: `${json['token_type']} ${json['access_token']}`
        }
    });
    
    const userJson = await userResponse.json();
    req.session.user = userJson;

    req.session.save();
    res.redirect('/')
});

module.exports = { router }