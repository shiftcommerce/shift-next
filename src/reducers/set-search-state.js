// actionTypes
import * as types from '../actions/action-types'

export const initialState = {
  filterCategory: null
}

export default function setSearchState (state = initialState, action) {
  switch (action.type) {
    case types.SET_FILTER_CATEGORY:
      return Object.assign({}, state, {
        filterCategory: action.categoryName
      })

    case types.CLEAR_SEARCH_FILTER:
      return Object.assign({}, state, {
        filterCategory: null
      })

    default:
      return state
  }
}
