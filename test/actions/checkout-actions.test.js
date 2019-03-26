import * as checkoutActions from '../../src/actions/checkout-actions'
import * as actionTypes from '../../src/actions/action-types'

test('return SET_CHECKOUT_INPUT_VALUE on calling inputChange()', () => {
  // Arrange
  const dispatch = jest.fn()
  const checkout = {
    shippingAddress: {}
  }
  const getState = () => ({ checkout: checkout })

  const fn = checkoutActions.inputChange(
    'shippingAddress',
    'fullName',
    'Test Name'
  )
  const expectedPayload = {
    formName: 'shippingAddress',
    fieldName: 'fullName',
    fieldValue: 'Test Name'
  }

  // Act
  fn(dispatch, getState)

  // Asset
  expect(fn).toEqual(expect.any(Function))
  expect(dispatch).toHaveBeenCalledWith({ payload: expectedPayload, type: actionTypes.SET_CHECKOUT_INPUT_VALUE })
})

test('return SET_PAYMENT_METHOD on calling setPaymentMethod()', () => {
  // Arrange
  const expectedPayload = {
    paymentMethod: 'PayPal'
  }

  // Act
  const result = checkoutActions.setPaymentMethod('PayPal')

  // Assert
  expect(result).toEqual({payload: expectedPayload, type: actionTypes.SET_PAYMENT_METHOD})
})

test('return setPayPalOrderDetails on calling setPaymentMethod()', () => {
  // Arrange
  const payload = {
    orderID: '9B29180392286445Y',
    intent: 'AUTHORIZE',
    status: 'COMPLETED',
    purchaseUnitsReferenceID: '2213',
    authorizationID: '847484949',
    createdAt: '2019-03-25T15:58:41Z'
  }
  const expectedPayload = {
    orderDetails: payload
  }

  // Act
  const result = checkoutActions.setPayPalOrderDetails(payload)

  // Assert
  expect(result).toEqual({payload: expectedPayload, type: actionTypes.SET_PAYPAL_ORDER_DETAILS})
})

test('return SET_CHECKOUT_BILLING_ADDRESS on calling setCheckoutBillingAddress()', () => {
  // Arrange
  const payload = {
    first_name: 'test',
    last_name: 'buyer',
    email: 'testbuyer@flexcommerce.com',
    line_1: '1 Main Terrace',
    line_2: undefined,
    city: 'Wolverhampton',
    state: 'West Midlands',
    zipcode: 'W12 4LQ',
    country_code: 'GB',
    primary_phone: '0352878596',
    collapsed: true,
    completed: true,
    showEditButton: false
  }
  const expectedPayload = {
    address: payload
  }

  // Act
  const result = checkoutActions.setCheckoutBillingAddress(payload)

  // Assert
  expect(result).toEqual({payload: expectedPayload, type: actionTypes.SET_CHECKOUT_BILLING_ADDRESS})
})

test('return SET_CHECKOUT_SHIPPING_ADDRESS on calling setCheckoutShippingAddress()', () => {
  // Arrange
  const payload = {
    first_name: 'Test',
    last_name: 'Example',
    email: 'testbuyer@flexcommerce.com',
    line_1: 'Shift Commerce Ltd, Old School Boar',
    line_2: 'Calverley Street',
    city: 'Leeds',
    state: 'N/A',
    zipcode: 'LS1 3ED',
    country_code: 'GB',
    primary_phone: '0352878596',
    collapsed: true,
    completed: true,
    showEditButton: false
  }
  const expectedPayload = {
    address: payload
  }

  // Act
  const result = checkoutActions.setCheckoutShippingAddress(payload)

  // Assert
  expect(result).toEqual({payload: expectedPayload, type: actionTypes.SET_CHECKOUT_SHIPPING_ADDRESS})
})
