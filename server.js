const cheerio  = require('cheerio');
const app = require("express")();
const bodyParser = require('body-parser')
const cors = require('cors');
const axios = require('axios')

app.use(cors())
app.use(bodyParser.json());

app.get('/introduction/:articleName',async (req,res)=>{
    try {
        let language = req.headers['accept-language'] ? req.headers['accept-language'] : -1

        let {articleName} = req.params
        let responseObject = {
            scrapeDate: Date.now()
            , articleName
            , introduction: ''
        }
        let isBadInPut = new RegExp(/[^0-9a-zA-Z-_]/g).test(articleName)

        if(isBadInPut) {
            res.status(404).send("not allowed character")
        }
        else if(language.length>2){

            res.status(404).send("language spelled wrong")
        }
        else if(language===-1){
            console.log('2')
            res.status(404).send("language not specified")
        }
        else {
            console.log('3')
            let htmlPage = (await axios.get(`https://${language}.wikipedia.org/wiki/${articleName}`)).data
            let $ = cheerio.load(htmlPage)
            responseObject.introduction = $('#mw-content-text > div.mw-parser-output > p:nth-child(6)').text()
            console.log(responseObject.introduction)
            res.json(responseObject)
        }

    }
    catch (e){
        if(e.response){
            if (e.response.status>=400&&e.response.status<500) {
                res.status(404).send("no such Page exist")
            }
            if (e.response.status>=500&&e.response.status<600){
                res.status(501).send("server crushed")
            }
        }

    }





})


app.listen(3000, () => {
    console.log("apps running 3000");
});