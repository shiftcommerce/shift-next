// actionTypes
import * as types from '../actions/action-types'

const initialState = {
  miniBagDisplayed: false
}

export default function setCart (state = initialState, action) {
  let newState = Object.assign({}, state)

  switch (action.type) {
    case types.CART_UPDATED:
      return Object.assign({}, state, action.payload)

    case types.SET_ORDER:
      return {}

    case types.TOGGLE_MINIBAG:
      return Object.assign({}, state, { miniBagDisplayed: !state.miniBagDisplayed })

    default:
      return newState
  }
}
