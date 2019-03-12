// actionTypes
import * as types from '../actions/action-types'

export const initialState = {
  loading: true,
  data: {}
}

export default function setOrders (state = initialState, action) {
  switch (action.type) {
    case types.GET_CUSTOMER_ORDERS:
      return Object.assign({}, state)

    case types.SET_CUSTOMER_ORDERS:
      return Object.assign({}, state, action.payload, { loading: false })

    default:
      return state
  }
}
