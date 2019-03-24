// Actions
import * as actionTypes from './action-types'
import { postEndpoint } from './api-actions'

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

export function setPaymentMethod (paymentMethod) {
  return {
    type: actionTypes.SET_PAYMENT_METHOD,
    payload: {
      paymentMethod: paymentMethod
    }
  }
}

export function setPayPalOrderDetails (orderDetails) {
  return {
    type: actionTypes.SET_PAYPAL_ORDER_DETAILS,
    payload: {
      order_details: orderDetails
    }
  }
}

export function updatePayPalOrderTotal (payPalOrderID, purchaseUnitsReferenceID, cart) {
  const request = {
    endpoint: '/patchPayPalOrder',
    body: {
      cart: {
        sub_total: cart.sub_total,
        total: cart.total,
        shipping_total: cart.shipping_total,
        tax: cart.tax,
      },
      payPalOrderID: payPalOrderID,
      purchaseUnitsReferenceID: purchaseUnitsReferenceID
    },
    requestActionType: actionTypes.PATCH_PAYPAL_ORDER,
    successActionType: actionTypes.SET_PAYPAL_ORDER_DETAILS,
    errorActionType: actionTypes.SET_PAYMENT_ERROR
  }
  return postEndpoint(request)
}

export function authorizePayPalOrder (payPalOrderID) {
  return () => {
    return new PayPalClient().authorizeOrder(payPalOrderID)
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
