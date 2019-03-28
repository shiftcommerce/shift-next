const { SHIFTClient } = require('@shiftcommerce/shift-node-api')
const stripe = require('stripe')(process.env.SECRET_STRIPE_API_KEY)

module.exports = {
  createOrder: async (req, res) => {
    const body = req.body
    const orderPayload = { data: body.data }
    const cardToken = body.card_token
    const paymentMethod = body.payment_method

    if (paymentMethod === 'card') {
      stripe.charges.create({
        amount: Math.round(orderPayload.data.attributes.total * 100),
        currency: orderPayload.data.attributes.currency,
        source: cardToken.id,
        capture: false
      }, (error, charge) => {
        if (error) {
          console.log(error)
          res.json(error)
        } else {
          orderPayload.data.attributes.payment_transactions_resources = [{
            attributes: {
              payment_gateway_reference: 'secure_trading_payment_pages',
              transaction_type: 'authorisation',
              gateway_response: {
                charge: charge
              },
              status: 'success',
              amount: orderPayload.data.attributes.total,
              currency: orderPayload.data.attributes.currency
            },
            type: 'payment_transactions'
          }]
          orderPayload.data.attributes.ip_address = cardToken.client_ip
          placeOrder(req, res, orderPayload)
        }
      })
    } else {
      return placeOrder(req, res, orderPayload)
    }
  }
}

async function placeOrder (req, res, orderPayload) {
  const response = await SHIFTClient.createOrderV1(orderPayload)

  if (response.status === 201) {
    res.clearCookie('cart', { signed: true })
  }

  switch (response.status) {
    case 404:
      return res.status(200).send({})
    case 422:
      return res.status(response.status).send(response.data.errors)
    default:
      return res.status(response.status).send(response.data)
  }
}
