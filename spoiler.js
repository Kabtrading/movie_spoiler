const cheerio = require('cheerio')
const request = require('request')
const readLine = require('readline-sync')
const baseGoogleUrl = 'https://www.google.ca/search?ei=EFU8W6XBHeS_0PEP6t2M8AY&q='
const baseMovieApiUrl = 'https://api.themoviedb.org/3/movie/'
const spoilerUrl = (id) => `${baseMovieApiUrl}${id}?api_key=5717394436bb20a2607c3eff96755ae7`
let movieTitle = process.argv[2]
let warningTime = parseInt(process.argv[3])

checkInput(movieTitle, warningTime)

function checkInput(movieTitle, warningTime) {
    if (movieTitle === undefined || warningTime === NaN) {
        let movieTitle = readLine.question('Please enter a movie title: ')
        let warningTime = readLine.questionInt('Please enter an appropriate time (seconds): ')
        checkInput(movieTitle, warningTime)
    } else {
        const googleUrl = `${baseGoogleUrl}${movieTitle} film`
        const urlQuery = `https://api.themoviedb.org/3/search/movie?api_key=5717394436bb20a2607c3eff96755ae7&query=${movieTitle}`
        spoilMovie(googleUrl, warningTime, urlQuery, movieTitle)
    }
}

function spoilMovie(googleUrl, warningTime, urlQuery, movieTitle) {
    request(googleUrl, (err, resp, body) => {
        if (err) return err
        let $ = cheerio.load(body)
        console.log('** spoiler warning ** about to spoil the movie "' + movieTitle + '" in "' + warningTime + '" seconds ');
        $('h3.r > a').each((i, elem) => {
            console.log($(elem).text());
        })

        request(urlQuery, (err, resp, body) => {
            if (err) return err
            let tmdbObj = JSON.parse(body)
            let id = tmdbObj.results[0].id

            request(spoilerUrl(id), (err, resp, body) => {
                if (err) return err
                let movieDataObj = JSON.parse(body)
                // console.log(movieDataObj)
                let spoiler = movieDataObj.overview
                setTimeout(() => {
                    console.log(spoiler)
                }, warningTime * 1000);
                setTimeout(() => {
                    if (readLine.keyInYN('Would you like to have another movie spoiled for you?')) {
                        checkInput()
                    } else {
                        console.log('Luke, I am your father!')
                    }
                }, warningTime * 1050);
            })
        })
    })
}