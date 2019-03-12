import * as accountActions from '../../src/actions/account-actions'
import * as actionTypes from '../../src/actions/action-types'
import * as apiActions from '../../src/actions/api-actions'

test('fetchAccountDetails() makes an account request', () => {
  const getAccountSpy = jest.spyOn(apiActions, 'readEndpoint')

  accountActions.fetchAccountDetails()

  expect(getAccountSpy).toHaveBeenCalledTimes(1)
  const request = getAccountSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/getAccount')
  expect(request.successActionType).toEqual(actionTypes.SET_ACCOUNT)

  getAccountSpy.mockRestore()
})

test('clearErrors() returns CLEAR_ACCOUNT_ERRORS action type', () => {
  // Act
  const action = accountActions.clearErrors()

  // Assert
  expect(action.type).toEqual(actionTypes.CLEAR_ACCOUNT_ERRORS)
})

test('getCustomerOrders() makes a customer orders request', () => {
  const getCustomerOrdersSpy = jest.spyOn(apiActions, 'readEndpoint')

  accountActions.getCustomerOrders()

  expect(getCustomerOrdersSpy).toHaveBeenCalledTimes(1)
  const request = getCustomerOrdersSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/customerOrders')
  expect(request.successActionType).toEqual(actionTypes.SET_CUSTOMER_ORDERS)

  getCustomerOrdersSpy.mockRestore()
})
