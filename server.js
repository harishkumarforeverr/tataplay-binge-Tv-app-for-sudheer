const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');
const bodyParser = require('body-parser');

var parentDir = path.join(__dirname, './src/');
const app = express();
const request = require('request');
const expressStaticGzip = require('express-static-gzip');


// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(bodyParser.json());

  

app.disable("x-powered-by");

app.post('/by-pass', function (req, response) {
    const url = req.body.url;
    console.log("calling url", url);
    request.get(
        url,
        (error, res, body) => {
            if (error) {
                console.error(error)
                return response.status(200).json({'content': "error"})
            }
            return response.status(200).json(JSON.parse(body))
        },
    )
})

app.use(require('prerender-node'));

app.use('/', expressStaticGzip(path.resolve(__dirname, './dist'), { maxAge: 7 * 24 * 60 * 60 * 1000, index: false }));

app.get("/eula", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'eula.html'))
})

app.get("/license", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'eula-hybrid.html'))
})

app.get("/privacyPolicy", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'privacy-policy-hybrid.html'))
})

app.get("/policy", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'privacy-policy-hybrid.html'))
})

app.get("/termsConditions", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditions.html'))
})

app.get("/conditions", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditions-hybrid.html'))
})

app.get("/primeTermsConditions", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'primeTermsConditions.html'))
})

app.get("/termsConditionsV1", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV1.html'))
})

app.get("/termsConditionsV2", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV2.html'))
})

app.get("/termsConditionsV3", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV3.html'))
})

app.get("/termsConditionsV4", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV4.html'))
})

app.get("/termsConditionsV5", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV5.html'))
})

app.get("/termsConditionsV6", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV6.html'))
})

app.get("/termsConditionsV7", (request, response) => {
    response.sendFile(path.resolve(__dirname, 'dist', 'termsConditionsV7.html'))
})

app.get('/versionInfo', function (req, res, next) {
    res.send('<h2>Current Version: 7.0.5</h2>');
});

app.get('/robots.txt', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "robots.txt"));
});

app.get('/sitemap.xml', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "sitemap.xml"));
});

app.get('/page-not-found', (req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, 'dist', 'notFoundPage.html'));
});

app.get('*', function (request, response) {
    response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.header('Expires', '-1');
    response.header('Pragma', 'no-cache');
    response.sendFile(path.resolve(__dirname, 'dist', 'index.html'),{maxAge: 0})
})

app.use('/healthcheck', require('express-healthcheck')())

app.listen(3000, function () {
    console.log('Example app listening on port 3000!\n');
})