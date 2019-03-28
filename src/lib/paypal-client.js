// Libraries
const paypal = require('@paypal/checkout-server-sdk')

class PayPalClient {
  /**
   * Initializes the class.
   * @constructor
   */
  constructor () {
    this.payPalClientID = process.env.PAYPAL_CLIENT_ID
    this.payPalClientSecret = process.env.PAYPAL_CLIENT_SECRET
    this.client = new paypal.core.PayPalHttpClient(this.environment())
  }

  /**
   * Returns the PayPal environment
   */
  environment () {
    return new paypal.core.SandboxEnvironment(this.payPalClientID, this.payPalClientSecret)
    // * Since we are running the apps in production mode in every environment
    // commenting this logic out for now
    // 
    // if (process.env.NODE_ENV === 'production') {
    //   return new paypal.core.LiveEnvironment(this.payPalClientID, this.payPalClientSecret)
    // } else {
    //   return new paypal.core.SandboxEnvironment(this.payPalClientID, this.payPalClientSecret)
    // }
  }

  /**
   * Performs authorization on the approved order.
   * @param payPalOrderID
   */
  async authorizeOrder(payPalOrderID) {
    try {
      const request = new paypal.orders.OrdersAuthorizeRequest(payPalOrderID)
      request.requestBody({})
      const response = await this.client.execute(request)
      const authorization = response.result.purchase_units[0].payments.authorizations[0]
      return {
        status: response.status,
        data: {
          id: authorization.id,
          status: authorization.status,
          expirationTime: authorization.expiration_time
        }
      }
    } catch (error) {
      console.error(`PayPal Client: Error while authorizing order ${payPalOrderID}`, error)
      return { error }
    }
  }

  /**
   * Updates the order total
   * @param {string} payPalOrderID
   * @param {string} purchaseUnitsReferenceID
   * @param {object} cart
   */
  async patchOrder (payPalOrderID, purchaseUnitsReferenceID, cart) {
    const request = new paypal.orders.OrdersPatchRequest(payPalOrderID)
    console.log({payPalOrderID})
    console.log({purchaseUnitsReferenceID})
    console.log({cart})
    console.log("pp payload", JSON.stringify(this.buildPatchOrderPayload(purchaseUnitsReferenceID, cart)))
    request.requestBody(this.buildPatchOrderPayload(purchaseUnitsReferenceID, cart))
    try {
      const response = await this.client.execute(request)
      return { status: response.status, data: response.data }
    } catch (error) {
      console.error(`PayPal Client: Error while patching order ${payPalOrderID}`, error)
      return { error }
    }
  }

  /**
   * Builds the patch order payload
   * @param {string} purchaseUnitsReferenceID
   * @param {object} cart
   */
  buildPatchOrderPayload (purchaseUnitsReferenceID, cart, currency_code = 'GBP') {
    return [
      {
        'op': 'replace',
        'path': '/intent',
        'value': 'AUTHORIZE'
      },
      {
        'op': 'replace',
        'path': `/purchase_units/@reference_id=='${purchaseUnitsReferenceID}'/amount`,
        'value': {
          'currency_code': `${currency_code}`,
          'value': `${cart.total}`,
          'breakdown': {
            'item_total': {
              'currency_code': `${currency_code}`,
              'value': `${cart.subTotal}`
            },
            'tax_total': {
              'currency_code': `${currency_code}`,
              'value': `${cart.tax}`
            },
            'shipping': {
              'currency_code': `${currency_code}`,
              'value': `${cart.shippingTotal}`
            },
            'shipping_discount': {
              'currency_code': `${currency_code}`,
              'value': `${cart.shippingDiscount}`
            }
          }
        }
      }
    ]
  }
}

module.exports = { 
  PayPalClient: new PayPalClient()
}
