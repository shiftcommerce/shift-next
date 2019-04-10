import setOrder from '../../src/reducers/set-order'
import * as actionTypes from '../../src/actions/action-types'

test('sets paymentAuthorization details when a PayPal order is authorized', () => {
  // Arrange
  const payload = {
    id: '0557749097767711F',
    status: 'CREATED',
    expirationTime: '2019-04-24T20:47:07Z'
  }
  const action = {
    type: actionTypes.SET_ORDER_PAYPAL_AUTHORIZATION_DETAILS,
    payload: payload
  }
  const currentState = {
    paymentAuthorization: {}
  }

  // Act 
  const updatedState = setOrder(currentState, action)

  // Assert
  expect(updatedState.paymentAuthorization).toEqual(payload)
})

test('sets paymentResponseErrors details when a PayPal order authorization is unsuccessful', () => {
  // Arrange
  const payload = {
    error: {
      data: "some api error message"
    }
  }
  const action = {
    type: actionTypes.SET_PAYMENT_RESPONSE_ERRORS,
    payload: payload
  }
  const currentState = {
    paymentResponseErrors: {}
  }

  // Act 
  const updatedState = setOrder(currentState, action)

  // Assert
  expect(updatedState.paymentResponseErrors).toEqual(payload)
})
