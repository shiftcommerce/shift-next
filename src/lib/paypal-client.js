// Libraries
// import paypal from '@paypal/checkout-server-sdk'
import ShiftNextConfig from '../lib/config'

class PayPalClient {
  /**
   * Initializes the class.
   * @constructor
   */
  constructor () {
    this.client = new paypal.core.PayPalHttpClient(this.environment())
  }

  /**
   * Returns the PayPal environment
   */
  environment () {
    const paypalClientID = ShiftNextConfig.get().paypalClientID
    const paypalClientSecret = ShiftNextConfig.get().paypalClientSecret
    if (process.env.NODE_ENV === 'production') {
      new paypal.core.LiveEnvironment(paypalClientID, paypalClientSecret)
    } else {
      new paypal.core.SandboxEnvironment(paypalClientID, paypalClientSecret)
    }
  }

  /**
   * Performs authorization on the approved order.
   * @param payPalOrderID
   */
  async authorizeOrder(payPalOrderID) {
    try {
      const request = new paypal.orders.OrdersAuthorizeRequest(payPalOrderID)
      request.requestBody({})
      const response = await this.client.execute(request);
      return {
        orderID: response.result.id,
        status: response.result.status,
        authorizationID: response.result.purchase_units[0].payments.authorizations[0].id
      }
    } catch (error) {
      console.error('PayPal Client: Error while authorizing order', error)
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
    request.requestBody(this.buildPatchOrderPayload(purchaseUnitsReferenceID, cart))
    try {
      const response = await this.client.execute(request)
      return { status: response.status, data: response.data }
    } catch (error) {
      console.error('PayPal Client: Error while patching order', error)
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
        'path': `/purchase_units/@reference_id==${purchaseUnitsReferenceID}/amount`,
        'value': {
          'currency_code': `${currency_code}`,
          'value': `${cart.total}`,
          'breakdown': {
            'item_total': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.sub_total}`
            },
            'shipping': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.shipping_total}`
            },
            'shipping_discount': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.shipping_total_discount}`
            },
            'tax_total': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.tax}`
            }
          }
        }
      }
    ]
  }
}

export default PayPalClient
