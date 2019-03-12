// actionTypes
import * as types from '../actions/action-types'

export const initialState = {
  cardTokenRequested: false,
  cardToken: {},
  paymentError: null,
  error: false,
  card_errors: true,
  loading: false
}

export default function setOrder (state = initialState, action) {
  switch (action.type) {
    case types.SET_ORDER:
      return Object.assign({}, state, action.payload)

    case types.REQUEST_CARD_TOKEN:
      return Object.assign({}, state, { cardTokenRequested: action.value })

    case types.SET_CARD_TOKEN:
      return Object.assign({}, state, { cardToken: action.value })

    case types.SET_PAYMENT_ERROR:
      return Object.assign({}, state, { paymentError: action.value })

    case types.CARD_ERRORS:
      return Object.assign({}, state, { card_errors: action.errors })

    default:
      return state
  }
}
