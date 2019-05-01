import * as types from '../actions/action-types'

export const initialState = {
  loading: false
}

export default function setGlobal (state = initialState, action) {
  switch(action.type) {
    case types.TOGGLE_LOADING:
      return Object.assign({}, state, {
        loading: action.loading
      })

    default:
      return state;
  }
}
