module.exports = {
  /**
   * Route for Checkout Review. Simply redirects to the payment page
   * @param  {Object}   req
   * @param  {Object}   res
   */
  reviewRoute: (req, res) => {
    res.redirect('/checkout/payment')
  },

  loginRoute: (req, res, next) => {
    const { customerId } = req.session
    const { signedIn } = req.cookies

    // If there is a customer ID, redirect to payment-method page
    if (customerId) {
      // If there is a customer ID (in the session), but the customer isn't
      // signed in, update the session and update the `signedIn` cookie in the
      // client
      if (!signedIn) {
        setUserToLoggedIn(req, res)
      }
      return res.redirect('/checkout/payment-method')
    }

    // If the customer is not in the session, go to the next handler
    next()
  }
}
