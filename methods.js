const cheerio  = require('cheerio');
const app = require("express")();
const bodyParser = require('body-parser')
const cors = require('cors');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const {jwtSecret} = require('./.env')


const signToken = (username) => {
    const jwtPayload = { username };
    return jwt.sign(jwtPayload, jwtSecret);
};
const verifyToken = (token,res) => {

    return new Promise((res,rej)=> {
        jwt.verify(token, jwtSecret, function (err, decoded) {
            if(err){

                throw err
            }
            else{
                res(decoded.username)
            }
        })
    }).catch(err=>{

        res.status(401).send(err.message)
    })

}
const userInputCheck = (articleName,res) => {
    //checks wether wrong letter exist in the input
    let isBadInPut = new RegExp(/[^0-9a-zA-Z-_]/g).test(articleName)

    if (isBadInPut) {
        res.status(404).send("not allowed character")
    }
}

const authorizeUser = async (req,res) => {
    let token = req.headers['x-authentication'] ? req.headers['x-authentication'] : -1
    if (token === -1) {
        res.status(404).send("not allowed user")
    } else {

        let userName = await verifyToken(token, res)
        return userName
    }
}

const parsingFirstParagraph = async(articleName,language,res) => {
    try {
        let htmlPage = (await axios.get(`https://${language}.wikipedia.org/wiki/${articleName}`)).data
        let $ = cheerio.load(htmlPage)
        return $('#mw-content-text > div.mw-parser-output > p:nth-child(6)').text()
    }
    catch (e){
        if(e.response){
            if (e.response.status>=400&&e.response.status<500) {
                res.status(404).send("no such Page exist")
            }
            if (e.response.status>=500&&e.response.status<600){
                res.status(501).send("server crushed")
            }
            else{
                console.log(e)
                res.status(401).send(e.response.message)
            }
        }
    }
}

module.exports = {
    authorizeUser,
    signToken,
    verifyToken,
    userInputCheck,
    parsingFirstParagraph
}