// Actions
import * as actionTypes from './action-types'

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
