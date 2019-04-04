// Actions
import * as actionTypes from './action-types'
import { postEndpoint } from './api-actions'
import { createOrder } from './order-actions'

// Store the input change info in the local redux store
function storeInputChange (formName, fieldName, fieldValue) {
  return {
    type: actionTypes.SET_CHECKOUT_INPUT_VALUE,
    payload: {
      formName: formName,
      fieldName: fieldName,
      fieldValue: fieldValue
    }
  }
}

function storeValidationMessage (formName, fieldName, validationMessage) {
  return {
    type: actionTypes.SET_CHECKOUT_INPUT_VALIDATION_MESSAGE,
    payload: {
      formName: formName,
      fieldName: fieldName,
      validationMessage: validationMessage
    }
  }
}

export function autoFillAddress (address) {
  return {
    type: actionTypes.AUTOFILL_ADDRESS,
    address: address
  }
}

export function autoFillBillingAddress (address) {
  return {
    type: actionTypes.AUTOFILL_BILLING_ADDRESS,
    address: address
  }
}

export function inputChange (formName, fieldName, fieldValue) {
  return (dispatch) => {
    dispatch(storeInputChange(formName, fieldName, fieldValue))
  }
}

export function setValidationMessage (formName, fieldName, errorMessage) {
  return (dispatch) => {
    dispatch(storeValidationMessage(formName, fieldName, errorMessage))
  }
}

export function showField (formName, fieldName) {
  return {
    type: actionTypes.SET_CHECKOUT_INPUT_SHOWN,
    payload: {
      formName: formName,
      fieldName: fieldName
    }
  }
}

export function updatePayPalOrderTotal (payPalOrderID, purchaseUnitsReferenceID, cart) {
  const request = {
    endpoint: '/patchPayPalOrder',
    body: {
      cart: {
        subTotal: cart.sub_total,
        total: cart.total,
        discount: cart.total_discount,
        tax: cart.tax,
        shippingTotal: cart.shipping_total,
        // This remove the '-' from the value
        shippingDiscount: Math.abs(cart.shipping_total_discount),
        freeShipping: cart.free_shipping
      },
      payPalOrderID: payPalOrderID,
      purchaseUnitsReferenceID: purchaseUnitsReferenceID
    },
    requestActionType: actionTypes.PATCH_PAYPAL_ORDER,
    errorActionType: actionTypes.SET_PAYMENT_RESPONSE_ERRORS
  }
  return postEndpoint(request)
}

export function authorizePayPalOrder (payPalOrderID) {
  const request = {
    endpoint: '/authorizePayPalOrder',
    body: {
      payPalOrderID: payPalOrderID
    },
    requestActionType: actionTypes.AUTHORIZE_PAYPAL_ORDER,
    successActionType: actionTypes.SET_ORDER_PAYPAL_AUTHORIZATION_DETAILS,
    errorActionType: actionTypes.SET_PAYMENT_RESPONSE_ERRORS
  }
  return postEndpoint(request)
}

export function authorizePayPalAndCreateOrder (payPalOrderID, paymentMethod) {
  return (dispatch, getState) => {
    // authorize the PayPal Order
    return dispatch(authorizePayPalOrder(payPalOrderID)).then(() => {
      const order = getState().order
      if (!order.paymentResponseErrors.error.data) {
        // create order
        return dispatch(createOrder(getState().cart, paymentMethod, order))
      }
    })
  }
}

export function setCheckoutBillingAddress (address) {
  return {
    type: actionTypes.SET_CHECKOUT_BILLING_ADDRESS,
    payload: {
      address: address
    }
  }
}

export function setCheckoutShippingAddress (address) {
  return {
    type: actionTypes.SET_CHECKOUT_SHIPPING_ADDRESS,
    payload: {
      address: address
    }
  }
}
