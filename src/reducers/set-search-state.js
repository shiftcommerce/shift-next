// actionTypes
import * as types from '../actions/action-types'

export const initialState = {
  loading: true,
  error: false,
  query: null
}

export default function setSearchState (state = initialState, action) {
  switch (action.type) {
    case types.SET_SEARCH_STATE:
      let newState = Object.assign(state, action.searchState)
      Object.keys(newState).map((key) => {
        if (!action.searchState[key]) {
          delete newState[key]
        }
      })
      return newState

    case types.SET_SEARCH_QUERY:
      return Object.assign({}, state, { query: action.query })

    default:
      return state
  }
}
