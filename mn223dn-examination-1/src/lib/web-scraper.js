const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request')

const urls = []

module.exports = {
  scrape: scrape
}

function scrape (_url) {
  getUrls(_url).then(() => scrapeCalenders(urls[0])
    .then(res => scrapeFilmsNames(urls[1], res)
      .then(res => scrapeCinema(urls[1], res)
        .then(res => logIn(urls[2], res)
          .then(res => scrapeResturant(res)
          )
        )
      )
    )
  ).catch(function (error) {
    console.log(error)
  })
}

function getUrls (_mainUrl) {
  return new Promise(function (resolve, reject) {
    axios.get(_mainUrl).then(resp => {
      const data = resp.data
      const $ = cheerio.load(data)
      $('a').each(function (i, elem) {
        const text = $(elem).text().toLowerCase().trim()

        if (text.includes('calendar') || text.includes('cinema') || text.includes('restaurant')) {
          urls[i] = $(elem).attr('href')
        }
      })
      console.log('Scraping links...OK')
      resolve()
    }).catch(function (error) {
      console.error('Scraping links...ERROR')
      reject(error)
    })
  })
}

function scrapeCalenders (_url) {
  const calendarUrlsArr = []
  return new Promise(function (resolve, reject) {
    axios.get(_url).then(resp => {
      const data = resp.data
      const $ = cheerio.load(data)
      $('.col.s12.center').has('li a').children().children().children().each(function (i, elem) {
        calendarUrlsArr[i] = _url + $(elem).attr('href')
      })
    }).then(() => fetchCalendar(calendarUrlsArr)
      .then(res => {
        console.log('Scraping available days...OK')

        if (res.length === 0) {
          console.log('Nobody is available this weekend!!')
          return
        }
        resolve(res)
      })
    ).catch(function (error) {
      console.error('Scraping available days...ERROR')
      reject(error)
    })
  })
}

function fetchCalendar (_urlsArr) {
  return new Promise(function (resolve, reject) {
    var promises = []
    var result = []
    _urlsArr.forEach(elem => {
      promises.push(checkAvailability(elem))
    })
    Promise.all(promises).then(arr => {
      if (arr[0][0] & arr[1][0] & arr[2][0] === 1) {
        result.push('05')
      }
      if (arr[0][1] & arr[1][1] & arr[2][1] === 1) {
        result.push('06')
      }
      if (arr[0][2] & arr[1][2] & arr[2][2] === 1) {
        result.push('07')
      }
      resolve(result)
    }).catch(function (error) {
      console.error('Fetch Calendars...ERROR')
      reject(error)
    })
  })
}

function checkAvailability (url) {
  var personalArr = []
  return new Promise(function (resolve, reject) {
    axios.get(url).then(resp => {
      var data = resp.data
      var $ = cheerio.load(data)
      personalArr = []
      $('tbody').children().children().each(function (i, elem) {
        if (elem.firstChild.data.toLowerCase().trim() === 'ok') {
          personalArr[i] = 1
        } else {
          personalArr[i] = 0
        }
      })
      resolve(personalArr)
    }).catch(function (error) {
      reject(error)
    })
  })
}

function scrapeCinema (url, res) {
  var moviesArr = []
  var promises = []
  var moviesNamesArr = res[0]
  var daysArr = res[1]

  return new Promise(function (resolve, reject) {
    daysArr.forEach(elem => {
      for (var i = 0; i < 3; i++) {
        var MovieUrl = url + '/check?day=' + elem + '&movie=0' + (i + 1)
        promises.push(getMoviesOn(MovieUrl, moviesNamesArr))
      }
    })

    Promise.all(promises).then(resp => {
      resp.forEach(elem => {
        elem.forEach(elem => {
          moviesArr.push(elem)
        })
      })
      if (moviesArr.length === 0) {
        console.log('All movies are fully booked this weekend!!')
        return
      }

      console.log('Scraping showtimes...OK')
      resolve(moviesArr)
    }).catch(function (error) {
      console.error('Scraping showtimes...ERROR')
      console.log(error)
    })
  })
}

function getMoviesOn (url, moviesNamesArr) {
  return new Promise(function (resolve, reject) {
    axios.get(url).then(resp => {
      const data = resp.data
      const avMoviesArr = []
      data.forEach(elem => {
        if (elem.status === 1) {
          var movie = {}
          if (elem.movie === '01') { movie.movieName = moviesNamesArr[0] } else if (elem.movie === '02') { movie.movieName = moviesNamesArr[1] } else if (elem.movie === '03') { movie.movieName = moviesNamesArr[2] }
          movie.day = elem.day
          movie.time = elem.time
          avMoviesArr.push(movie)
        }
      })
      resolve(avMoviesArr)
    })
      .catch(function (error) {
        reject(error)
      })
  })
}

function scrapeFilmsNames (url, res) {
  var moviesNamesArr = []
  return new Promise(function (resolve, reject) {
    axios.get(url).then(resp => {
      var $ = cheerio.load(resp.data)
      $('#movies option').next().each(function (i, elem) {
        moviesNamesArr.push($(elem).text())
      })
      resolve([moviesNamesArr, res])
    })
      .catch(function (error) {
        reject(error)
      })
  })
}

function logIn (url, resp) {
  let logInUrl = ''
  return new Promise(function (resolve, reject) {
    axios.get(url).then(resp => {
      const data = resp.data
      const $ = cheerio.load(data)('form').attr('action')
      logInUrl = url + '/' + $.split('/')[2]
      urls.push(logInUrl)
    }).then(() => getCookie(logInUrl)
      .then(res => setCookie(res, url)
        .then(res => resolve([res[0].data, res[1], res[2], resp]))
      )
    ).catch(function (error) {
      reject(error)
    })
  })
}

function getCookie (url) {
  return new Promise(function (resolve, reject) {
    request.post({
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      url: url,
      form: {
        username: 'zeke',
        password: 'coys',
        submit: 'login'
      }
    }, function (error, response) {
      resolve(response)
      reject(error)
    })
  })
}

function setCookie (response, respurl) {
  return new Promise(function (resolve, reject) {
    const cookies = response.headers['set-cookie'].toString().split(';')[0]
    const url = respurl + '/' + response.headers.location
    axios(url, {
      headers: { cookie: cookies }
    })
      .then(response => resolve([response, cookies, url]))
      .catch(function (error) {
        console.error('set cookie error')
        reject(error)
      })
  })
}

function scrapeResturant (data) {
  var $ = cheerio.load(data[0])
  const cookie = data[1]
  const url = data[2]
  var avaArr = data[3]
  var arr = []

  avaArr.forEach(function (elem, ind) {
    var classTag = ''
    var restaurantTableArr = []

    if (elem.day === '05') { classTag = '.WordSection2' } else if (elem.day === '06') { classTag = '.WordSection4' } else if (elem.day === '07') { classTag = '.WordSection6' }

    $(classTag).children().children('span').each(function (i, elem) {
      restaurantTableArr.push($(elem).text().toLowerCase())
    })
    for (var i = 0; i < restaurantTableArr.length; i++) {
      if (restaurantTableArr[i].substr(0, 2) > elem.time && restaurantTableArr[i].includes('free')) {
        elem.tableAvaAt = restaurantTableArr[i].substring(0, 2) + restaurantTableArr[i].substring(3, 5)
        arr.push(elem)
      }
    }
  })
  if (arr.length === 0) {
    console.log('Restaurant is fully booked this weekend!!')
    return
  }
  console.log('Scraping possible reservations...OK')

  printOutput(arr)

  const token = $('input').filter(function (i, el) {
    return $(this).attr('name') === 'csrf_token'
  }).attr('value')
  let obj = arr[0]

  if (obj.day === '05') { obj = 'fri' + obj.tableAvaAt } else if (obj.day === '06') { obj = 'sat' + obj.tableAvaAt } else if (obj.day === '07') { obj = 'sun' + obj.tableAvaAt }

  bookTable(obj, url, cookie, token).then(res => {
    $ = cheerio.load(res.body)
    if ($('.center').text().trim().toLowerCase().includes('reservation is made')) { console.log('--- Booking of the first recommendation is done --- \n') } else if (res.body === 'Unauthorized') {
      (
        console.log('booking table error')
      )
    }
  }).catch(function (error) {
    throw new Error(error)
  })
}

function printOutput (arr) {
  console.log('\n Recommendations \n ============== \n')
  arr.forEach(elem => {
    var day = ''
    if (elem.day === '05') { day = 'Friday' } else if (elem.day === '06') { day = 'Saturday' } else if (elem.day === '07') { day = 'Sunday' }
    console.log('* On ' + day + ', the movie "' + elem.movieName + '" starts at ' + elem.time + ' and there is a free table between ' + elem.tableAvaAt.substring(0, 2) + '-' + elem.tableAvaAt.substring(2, 4) + '\n')
  })
}

function bookTable (object, url, cookie, csrfToken) {
  return new Promise(function (resolve, reject) {
    request.post({
      headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookie },
      url: url,
      form: {
        group1: object,
        csrf_token: csrfToken
      }
    }, function (error, response) {
      resolve(response)
      reject(error)
    })
  })
}
