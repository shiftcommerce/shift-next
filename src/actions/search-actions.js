// actionTypes
import * as actionTypes from './action-types'

export function setSearchFilter (categoryName) {
  return {
    categoryName,
    type: actionTypes.SET_FILTER_CATEGORY
  }
}

export function clearSearchFilter () {
  return {
    type: actionTypes.CLEAR_SEARCH_FILTER
  }
}
