// Libs
const PayPalClient = require('../lib/paypal-client')

module.exports = {
  patchOrder: async (req, res) => {
    console.log({ body: req.body })
    const response = await new PayPalClient().patchOrder(
      req.body.payPalOrderID,
      req.body.purchaseUnitsReferenceID,
      req.body.cart
    )
    return res.status(response.status).send(response.data)
  }
}
