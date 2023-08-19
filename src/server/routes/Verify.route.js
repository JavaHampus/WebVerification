const express = require('express')
const { SERVER } = require('../../../config.json')

const VerifyRouter = express.Router()

VerifyRouter.get('/', (req, res) => {
    res.render('verify.ejs')
});

module.exports = { VerifyRouter }