// Libs
import { getSessionExpiryTime } from '../lib/session'

/**
 * Sets the user to logged in, by updating the session expiry time, and adding
 * the signedIn cookie to the client
 * @param  {Object} req
 * @param  {Object} res
 */
const setUserToLoggedIn = (req, res) => {
  // Get a Date instance based on the expiry set above
  const sessionExpiryTime = getSessionExpiryTime()

  req.session.expires = sessionExpiryTime
  res.cookie('signedIn', true, { expires: sessionExpiryTime })
}

module.exports = {
  /**
   * Route for Account Login
   * @param  {Object}   req
   * @param  {Object}   res
   * @param  {Function} next
   */
  loginRoute: (req, res, next) => {
    const { customerId } = req.session
    const { signedIn } = req.cookies

    // If there is a customer ID, redirect to the myaccount page
    if (customerId) {
      // If there is a customer ID (in the session), but the customer isn't
      // signed in, update the session and update the `signedIn` cookie in the
      // client
      if (!signedIn) {
        setUserToLoggedIn(req, res)
      }
      return res.redirect('/account/myaccount')
    }

    // If the customer is not in the session, go to the next handler
    next()
  },

  /**
   * Route for Account Logout
   * @param  {Object} req
   * @param  {Object} res
   */
  logoutRoute: (req, res) => {
    req.session = null
    res.clearCookie('signedIn')
    res.clearCookie('cart', { signed: true })
    res.redirect('/')
  },

  /**
   * Route for Account Register
   * @param  {Object}   req
   * @param  {Object}   res
   * @param  {Function} next
   */
  registerRoute: (req, res, next) => {
    const { customerId } = req.session
    // If there is a customerId, redirect to my account page.
    if (customerId) {
      return res.redirect('/account/myaccount')
    }

    // If the customer is not in the session, go to the next handler
    next()
  },

  /**
   * Route for Account View
   * @param  {Object}   req
   * @param  {Object}   res
   * @param  {Function} next
   */
  viewRoute: (req, res, next) => {
    const { customerId } = req.session
    const { signedIn } = req.cookies

    // If there is no customerId, clear signedIn cookie and redirect to the
    // login page
    if (!customerId) {
      res.clearCookie('signedIn')
      return res.redirect('/account/login')
    }

    // If there is a customer ID (in the session), but the customer isn't
    // signed in, update the session and update the `signedIn` cookie in the
    // users browser
    if (customerId && !signedIn) {
      setUserToLoggedIn(req, res)
    }

    // If the customer is not in the session, go to the next handler
    next()
  }
}
