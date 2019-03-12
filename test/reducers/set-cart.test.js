import setCart from '../../src/reducers/set-cart'
import * as actionTypes from '../../src/actions/action-types'

test('returns an empty cart when SET_ORDER is dispatched', () => {
  expect(setCart({ key: 'value' }, { type: actionTypes.SET_ORDER })).toEqual({})
})

test('returns an updated cart when CART_UPDATED is dispatched', () => {
  const action = {
    type: actionTypes.CART_UPDATED,
    payload: {
      key: 'new value'
    }
  }

  expect(setCart({ key: 'value' }, action)).toEqual({
    key: 'new value'
  })
})

test("doesn't change the state when an unrecognized action is dispatched", () => {
  const action = {
    type: 'UNKNOWN',
    payload: {
      key: 'new value'
    }
  }

  expect(setCart({ key: 'value' }, action)).toEqual({
    key: 'value'
  })
})
