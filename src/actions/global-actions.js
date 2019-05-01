import * as types from './action-types'

export function toggleLoading(state) {
  return {
    type: types.TOGGLE_LOADING,
    loading: state
  }
}
