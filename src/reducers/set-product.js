// actionTypes
import * as types from '../actions/action-types'

export const initialState = {
  loading: true,
  error: false
}

export default function setProduct (state = initialState, action) {
  switch (action.type) {
    case types.GET_PRODUCT:
      return Object.assign({}, state)
    case types.SET_PRODUCT:
      return Object.assign({}, state, action.payload, { loading: false })

    default:
      return state
  }
}
