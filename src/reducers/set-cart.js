// actionTypes
import * as types from '../actions/action-types'

export default function setCart (state, action) {
  let newState = Object.assign({}, state)

  switch (action.type) {
    case types.CART_UPDATED:
      return Object.assign({}, state, action.payload)

    case types.SET_ORDER:
      return {}

    default:
      return newState
  }
}
