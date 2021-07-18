const cheerio  = require('cheerio');
const app = require("express")();
const bodyParser = require('body-parser')
const cors = require('cors');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const {jwtSecret} = require('./.env')
const {authorizeUser,signToken,userInputCheck,parsingFirstParagraph} = require('./methods')
app.use(cors())
app.use(bodyParser.json());


let userTable = {}


app.get('/introduction/:articleName',async (req,res)=>{

        let {articleName} = req.params
        userInputCheck(articleName,res)
        let userName = authorizeUser(req,res)
        let language = userTable[userName]
        let introduction = parsingFirstParagraph(articleName,language,res)
        res.json( {
                scrapeDate: Date.now()
                , articleName
                , introduction
            })
})

app.post('/user',async(req,res)=>{
    let {userName,language} = req.body
    let token = signToken(userName)
    userTable[userName] = language
    res.json(token)
})


app.listen(3000, () => {
    console.log("apps running 3000");
});