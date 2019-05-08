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

test('updateCustomerAccount() makes a correct request', () => {
  const updateAccountSpy = jest.spyOn(apiActions, 'postEndpoint')

  const details = {
    day: '10',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Kowalski',
    mobilePhone: '07123456789',
    month: 'January',
    year: '2000'
  }

  accountActions.updateCustomerAccount(details)

  expect(updateAccountSpy).toHaveBeenCalledTimes(1)
  const request = updateAccountSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/updateCustomerAccount')
  expect(request.successActionType).toEqual(actionTypes.SET_ACCOUNT)
  expect(request.body).toEqual({
    firstName: 'John',
    lastName: 'Kowalski',
    email: 'test@example.com',
    mobilePhone: '07123456789',
    day: '10',
    month: 'January',
    year: '2000'
  })

  updateAccountSpy.mockRestore()
})
