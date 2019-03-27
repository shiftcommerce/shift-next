// Libs
const { PayPalClient } = require('../lib/paypal-client')

module.exports = {
  patchOrder: async (req, res) => {
    const response = await PayPalClient.patchOrder(
      req.body.payPalOrderID,
      req.body.purchaseUnitsReferenceID,
      req.body.cart
    )
    return res.status(response.status).send(response.data)
  },
  authorizeOrder: async (req, res) => {
    const response = await PayPalClient.authorizeOrder(
      req.body.payPalOrderID
    )
    return res.status(response.status).send(response.data)
  }
}
