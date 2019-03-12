const Cookies = require('js-cookie')
const { getSessionExpiryTime } = require('./session')

export function setCookie () {
  Cookies.set('signedIn', true, {
    expires: getSessionExpiryTime()
  })
}
