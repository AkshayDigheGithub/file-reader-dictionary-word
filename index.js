const http = require('http')
const https = require('https')

const filePath = 'http://norvig.com/big.txt'
const key = `enter key here`
let APIURL = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${key}&lang=en-en&text=%word%`

async function main() {
    const response = await callAPIMethod(filePath, http)
    const re = await getTenWords(response)
    const finalResponse = await dictionaryCreator(re)
    console.log('Final response is', finalResponse)
}


async function dictionaryCreator(words) {
    return Promise.all(
        Object.entries(words).map(async w => {
            const api = APIURL.replace('%word%', w[0])
            let JSONPARSER = JSON.parse(await callAPIMethod(api, https))
            return {
                Word: w[0],
                Output: {
                    Count: w[1],
                    Synonyms: JSONPARSER.def[0] && JSONPARSER.def[0].text || '',
                    Pos: JSONPARSER.def[0] && JSONPARSER.def[0].pos || ''

                }
            }
        })
    )
}

// check word occurances and select 10 words
async function getTenWords(str) {
    let replcaedStr = str.replace(/[^a-zA-Z ]/g, " ").split(" ");
    replcaedStr = replcaedStr.filter(w => w !== "")
    let StringArr = {}
    replcaedStr.map(word => {
        if (Reflect.has(StringArr, word)) {
            StringArr[word] = StringArr[word] += 1
        } else {
            StringArr[word] = 1
        }
    })

    let sorted = Object.fromEntries(
        Object.entries(StringArr).sort((a, b) => b[1] - a[1])
    )
    return Object.fromEntries(Object.entries(sorted).splice(0, 9))
}


// Call http & https Method
async function callAPIMethod(filePath, module) {
    return new Promise(resolve => {
        module.get(filePath, response => {
            let body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', function () {
                resolve(body)
            });
        });
    })
}

main()
