// exports.default = function () {
//   const state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
//   const action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}

//   switch (action.type) {
//     case 'TOGGLE_LOADING':
//       return Object.assign({}, state, {
//         loading: action.loading
//       })
//     default:
//       return state;
//   }
// }

import * as types from '../actions/action-types'

export const initialState = {
  loading: false
}

export default function setGlobal (state = initialState, action) {
  switch(action.type) {
    case 'TOGGLE_LOADING':
      return Object.assign({}, state, {
        loading: action.loading
      })

    default:
      return state;
  }
}