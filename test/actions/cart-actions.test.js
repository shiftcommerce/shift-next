import Cookies from 'js-cookie'

import * as cartActions from '../../src/actions/cart-actions'
import * as actionTypes from '../../src/actions/action-types'
import * as apiActions from '../../src/actions/api-actions'

describe('readCart', () => {
  test('returns a thunk returning a promise resolving to undefined if cart cookie is not present', async () => {
    const spy = jest.spyOn(Cookies, 'get').mockImplementation()
    const getState = () => ({ cart: {} })

    const thunk = cartActions.readCart(undefined, getState)
    const promiseResult = await thunk()
    expect(promiseResult).toEqual(undefined)

    spy.mockRestore()
  })

  test('returns a thunk returning a promise resolving to undefined if there is cart id in state', async () => {
    const spy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'cartCookie')
    const getState = () => ({ cart: { id: 10 } })

    const thunk = cartActions.readCart()
    const promiseResult = await thunk(undefined, getState)
    expect(promiseResult).toEqual(undefined)

    spy.mockRestore()
  })

  test('returns a thunk initiating a cart request when cart cookie exists but cart is not in state', async () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'cartCookie')
    const getState = () => ({ cart: {} })
    const readSpy = jest.spyOn(apiActions, 'readEndpoint').mockImplementation(() => 'readEndpoint')

    const thunk = cartActions.readCart()
    const promiseResult = await thunk(jest.fn(value => value), getState)
    expect(readSpy).toHaveBeenCalledTimes(1)
    expect(promiseResult).toEqual('readEndpoint')

    cookieSpy.mockRestore()
    readSpy.mockRestore()
  })

  test('returns a thunk initiating a cart request when forced', async () => {
    jest.spyOn(Cookies, 'get').mockImplementation(() => 'cartCookie')
    const getState = () => ({ cart: { id: 10 } })
    const readSpy = jest.spyOn(apiActions, 'readEndpoint').mockImplementation(() => 'readEndpoint')

    const thunk = cartActions.readCart({ force: true })
    const promiseResult = await thunk(jest.fn(value => value), getState)
    expect(readSpy).toHaveBeenCalledTimes(1)
    expect(promiseResult).toEqual('readEndpoint')

    readSpy.mockRestore()
  })
})

test('updateLineItemQuantity triggers a correct updateLineItemQuantity request', () => {
  const postSpy = jest.spyOn(apiActions, 'postEndpoint')

  cartActions.updateLineItemQuantity(10, 3)

  const requestObject = postSpy.mock.calls[0][0]
  expect(requestObject.endpoint).toEqual('/updateLineItem')
  expect(requestObject.body.lineItemId).toEqual(10)
  expect(requestObject.body.newQuantity).toEqual(3)
  expect(requestObject.successActionType).toEqual(actionTypes.CART_UPDATED)

  postSpy.mockRestore()
})

test('deleteLineItem triggers a correct deleteLineItem request', () => {
  const postSpy = jest.spyOn(apiActions, 'postEndpoint')

  cartActions.deleteLineItem(10)

  const requestObject = postSpy.mock.calls[0][0]
  expect(requestObject.endpoint).toEqual('/deleteLineItem/10')
  expect(requestObject.successActionType).toEqual(actionTypes.CART_UPDATED)

  postSpy.mockRestore()
})

test('addToCart triggers a correct addToCart request', () => {
  const postSpy = jest.spyOn(apiActions, 'postEndpoint')

  cartActions.addToCart(10, 1)

  const requestObject = postSpy.mock.calls[0][0]
  expect(requestObject.endpoint).toEqual('/addToCart')
  expect(requestObject.successActionType).toEqual(actionTypes.CART_UPDATED)

  postSpy.mockRestore()
})

test('setCartShippingAddress triggers a correct setCartShippingAddress request', () => {
  const postSpy = jest.spyOn(apiActions, 'postEndpoint')

  cartActions.setCartShippingAddress(10)

  const requestObject = postSpy.mock.calls[0][0]
  expect(requestObject.endpoint).toEqual('/setCartShippingAddress')
  expect(requestObject.body.addressId).toEqual(10)
  expect(requestObject.successActionType).toEqual(actionTypes.CART_UPDATED)

  postSpy.mockRestore()
})

test('setCartShippingMethod triggers a correct setShippingMethod request', () => {
  const postSpy = jest.spyOn(apiActions, 'postEndpoint')

  cartActions.setCartShippingMethod(10)

  const requestObject = postSpy.mock.calls[0][0]
  expect(requestObject.endpoint).toEqual('/setShippingMethod')
  expect(requestObject.successActionType).toEqual(actionTypes.CART_UPDATED)

  postSpy.mockRestore()
})

test('createShippingAddress triggers a correct createShippingAddress request', () => {
  const postSpy = jest.spyOn(apiActions, 'postEndpoint')

  cartActions.createShippingAddress({ addressKey: 'addressValue' })

  const requestObject = postSpy.mock.calls[0][0]
  expect(requestObject.endpoint).toEqual('/createAddress')
  expect(requestObject.body.addressKey).toEqual('addressValue')
  expect(requestObject.successActionType).toEqual(actionTypes.SHIPPING_ADDRESS_CREATED)

  postSpy.mockRestore()
})
