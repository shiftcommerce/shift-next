// Libraries
import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

import Config from '../lib/config'

class PayPalClient {
  /**
   * Initializes the class.
   * @constructor
   */
  constructor () {
    this.client = new checkoutNodeJssdk.core.PayPalHttpClient(
      new checkoutNodeJssdk.core.SandboxEnvironment(
        Config.get().paypalClientID,
        Config.get().paypalClientSecret
      )
    )
  }

  /**
   * Updates the order total
   * @param {integer} payPalOrderID
   * @param {string} purchaseUnitsReferenceID
   * @param {integer} cartTotal
   * @param {integer} cartSubTotal
   * @param {integer} shippingTotal
   */
  async updateOrderTotal (payPalOrderID, purchaseUnitsReferenceID, cartTotal, cartSubTotal, shippingTotal) {
    const request = new checkoutNodeJssdk.orders.OrdersPatchRequest(payPalOrderID)
    request.requestBody(this.buildPatchOrderPayload(purchaseUnitsReferenceID, cartTotal, cartSubTotal, shippingTotal))
    try {
      const response = await this.client.execute(request)
      return { status: response.status, data: response.data }
    } catch (error) {
      console.error('PayPal Client: Error while patching order', error)
      return { status: error.response.status, data: error }
    }
  }

  /**
   * Builds the patch order payload
   * @param {string} purchaseUnitsReferenceID
   * @param {integer} cartTotal
   * @param {integer} cartSubTotal
   * @param {integer} shippingTotal
   * @param {string} currency_code
   */
  buildPatchOrderPayload (purchaseUnitsReferenceID, cartTotal, cartSubTotal, shippingTotal, currency_code = 'GBP') {
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
          'value': `${cartTotal}`,
          'breakdown': {
            'item_total': {
              'currency_code': `${currency_code}`,
              'value':  `${cartSubTotal}`
            },
            'shipping_total': {
              'currency_code': `${currency_code}`,
              'value':  `${shippingTotal}`
            }
          }
        }
      }
    ]
  }
}

export default PayPalClient
