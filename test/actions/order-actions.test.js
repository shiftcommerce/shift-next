import * as orderActions from '../../src/actions/order-actions'
import * as actionTypes from '../../src/actions/action-types'
import * as apiActions from '../../src/actions/api-actions'

import mockCart from '../fixtures/actions/order-actions/cart.json'
import mockOrder from '../fixtures/actions/order-actions/order.json'

test('createOrder() converts cart into a valid request', () => {
  const postOrderSpy = jest.spyOn(apiActions, 'postEndpoint')

  const order = {
    cardToken: 'card_token',
    paymentAuthorization: {
      id: '10'
    }
  }

  orderActions.createOrder(mockCart, 'card', order)

  // Allow placed_at to be any date
  mockOrder.data.attributes.placed_at = expect.anything()

  expect(postOrderSpy).toHaveBeenCalledWith(expect.objectContaining({
    endpoint: '/createOrder',
    body: mockOrder,
    requestActionType: actionTypes.CREATE_ORDER,
    successActionType: actionTypes.SET_ORDER,
    errorActionType: actionTypes.ERROR_ORDER
  }))

  postOrderSpy.mockRestore()
})
