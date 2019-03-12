module.exports = {
  /**
   * Route for Checkout Review. Simply redirects to the payment page
   * @param  {Object}   req
   * @param  {Object}   res
   */
  reviewRoute: (req, res) => {
    res.redirect('/checkout/payment')
  }
}
