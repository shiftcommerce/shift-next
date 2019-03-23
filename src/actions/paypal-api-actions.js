// Libs
import PayPalClient from '../lib/paypal-client'

import { setPaymentError } from './order-actions'

export const updatePayPalOrderTotal = (payPalOrderID, purchaseUnitsReferenceID, cartTotal, cartSubTotal, shippingTotal) => {
  return (dispatch) => {
    return new PayPalClient().updateOrderTotal(payPalOrderID, purchaseUnitsReferenceID, cartTotal, cartSubTotal, shippingTotal)
      .then(response => response.data)
      .catch(error => dispatch(setPaymentError(error.message)))
  }
}
