// Libraries
// import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

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
   * Performs authorization on the approved order.    * 
   * @param orderID
   */
  async authorizeOrder(orderID) {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersAuthorizeRequest(orderID)
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
   * @param {object} paypalOrderDetails
   * @param {object} cart
   */
  async patchOrderTotal (paypalOrderDetails, cart) {
    const request = new checkoutNodeJssdk.orders.OrdersPatchRequest(paypalOrderDetails.orderID)
    request.requestBody(this.buildPatchOrderPayload(paypalOrderDetails, cart))
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
   * @param {object} paypalOrderDetails
   * @param {object} cart
   */
  buildPatchOrderPayload (paypalOrderDetails, cart, currency_code = 'GBP') {
    return [
      {
        'op': 'replace',
        'path': '/intent',
        'value': 'AUTHORIZE'
      },
      {
        'op': 'replace',
        'path': `/purchase_units/@reference_id==${paypalOrderDetails.purchaseUnitsReferenceID}/amount`,
        'value': {
          'currency_code': `${currency_code}`,
          'value': `${cart.total}`,
          'breakdown': {
            'item_total': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.sub_total}`
            },
            'discount_total': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.total_discount}`
            },
            'shipping_total': {
              'currency_code': `${currency_code}`,
              'value':  `${cart.shipping_total}`
            },
            'shipping_discount_total': {
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
