module.exports = {
  /**
   * Route for Order Index
   * When a customer successfully places an order via
   * checkout, the redirect to the order confirmation page occurs on the client
   * side. This serverside route is only hit when a full page reload is
   * initiated. As state is lost on page reload, the logic below redirects to
   * account page where the user can view their order in the order history.
   * @param  {Object}   req
   * @param  {Object}   res
   */
  indexRoute: (req, res) => {
    res.redirect('/account/myaccount')
  }
}
