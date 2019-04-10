// Libraries
const paypal = require('@paypal/checkout-server-sdk')

/**
 *  PayPalClient service
 * 
 * Responsibility: Facilitating the Order total update process as well as the order
 *                  authorisation process.
 * 
 * Documentation: https://github.com/shiftcommerce/shift-next/wiki/PayPal-Integration
 * 
 */
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
   * @return {object} - initialized PayPal environment
   */
  environment () {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PAYPAL_LIVE_ENVIRONMENT === 'true') {
      return new paypal.core.LiveEnvironment(this.payPalClientID, this.payPalClientSecret)
    } else {
      return new paypal.core.SandboxEnvironment(this.payPalClientID, this.payPalClientSecret)
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
    request.requestBody(this.buildPatchOrderPayload(purchaseUnitsReferenceID, cart))
    try {
      const response = await this.client.execute(request)
      return { status: response.statusCode, data: {} }
    } catch (error) {
      console.error(`PayPal Client: Error while patching order ${payPalOrderID}`, error.message)
      return { status: error.statusCode, data: error.message }
    }
  }

  /**
   * Performs authorization on the approved order.
   * @param {string} payPalOrderID
   * @return {object} - order authorization response
   */
  async authorizeOrder(payPalOrderID) {
    try {
      const request = new paypal.orders.OrdersAuthorizeRequest(payPalOrderID)
      request.requestBody({})
      const response = await this.client.execute(request)
      const authorization = response.result.purchase_units[0].payments.authorizations[0]
      return {
        status: response.statusCode,
        data: {
          id: authorization.id,
          status: authorization.status,
          expirationTime: authorization.expiration_time
        }
      }
    } catch (error) {
      console.error(`PayPal Client: Error while authorizing order ${payPalOrderID}`, error.message)
      return { status: error.statusCode, data: error.message }
    }
  }

  /**
   * Builds the patch order payload
   * @param {string} purchaseUnitsReferenceID
   * @param {object} cart
   * @return {object} - patch order payload
   */
  buildPatchOrderPayload (purchaseUnitsReferenceID, cart, currency_code = 'GBP') {
    return [
      {
        'op': 'replace',
        'path': `/purchase_units/@reference_id=='${purchaseUnitsReferenceID}'/amount`,
        'value': {
          'currency_code': `${currency_code}`,
          'value': `${cart.total}`
        }
      }
    ]
  }
}

module.exports = { 
  PayPalClient: new PayPalClient()
}
