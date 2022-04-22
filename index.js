const express = require('express')

require('dotenv').config()
const app = express()
const port = process.env.PORT || 8080

app.get('/create', (req, res) => {
    /* if (req.headers.authorization !== 'Basic QXp1cmVEaWFtb25kOmh1bnRlcjI=') {
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Try user: AzureDiamond, password: hunter2')
    return
    }
    
    const jwt = require('njwt')
    const claims = { iss: 'fun-with-jwts', sub: 'AzureDiamond' }
    const token = jwt.create(claims, 'ExperianJWTKey')
    token.setExpiration(new Date().getTime() + 60*1000)
    res.send(token.compact())*/
    res.send("NodeApp")
})

app.get('/verify/:token', (req, res) => {
    res.send(`TODO: verify this JWT: ${req.params.token}`)
})

const session = require('express-session')
const { ExpressOIDC } = require('@okta/oidc-middleware')

app.use(session({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: false
}))

const oidc = new ExpressOIDC({
    issuer: `${process.env.OKTA_ORG_URL}`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
    scope: 'openid profile'
})

app.use(oidc.router)

app.get('/auth/settoken', oidc.ensureAuthenticated(), (req, res) => {
    if (req.userinfo) { // or req.isAuthenticated()
        res.send(`Hi ${req.userinfo.name}! you are logged in`);
    } else {
        const jwt = require('njwt')
        const claims = { iss: 'exp', sub: 'manish' }
        const token = jwt.create(claims, 'ExperianJWTKey')
        token.setExpiration(new Date().getTime() + 60 * 1000)

        res.cookie('token', token.compact(), { maxAge: 900000, httpOnly: true })

        console.log('cookie have created successfully');
        res.send(req.headers);
    }
    // res.send('manish1!')
})

app.get('/welcome', oidc.ensureAuthenticated(), (req, res) => {
    if (req.isAuthenticated()) { // or req.isAuthenticated()
        const userContext = req.userContext;
        res.cookie('tokentest', userContext, { maxAge: 900000, httpOnly: true })
        res.send(`Hi ${userContext.userinfo.name}! you are logged in`);
    } else {
        res.send(`Please enter correct credentials`);
    }
})

/* oidc.on('ready', () => {
    app.listen(8080, () => console.log('OIDC app started'));
}); */

//app.listen(port, () => console.log(`JWT server listening on port ${port}!`))

const server = app.listen(port, () => {
    console.log("Server started on port " + port);
});
  
module.exports = server;