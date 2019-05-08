// Libraries
import t from 'typy'

// actionTypes
import * as types from '../actions/action-types'

export const initialState = {
  errors: [],
  loggedIn: false
}

export default function setAccount (state = initialState, action) {
  switch (action.type) {
    case types.SET_ACCOUNT:
      let accountObject

      if (action.payload) {
        console.log(action.payload.email)
        accountObject = Object.assign(initialState, {
          email: action.payload.email,
          firstName: action.payload.meta_attributes.first_name.value,
          lastName: action.payload.meta_attributes.last_name.value,
          mobilePhone: t(action, 'payload.meta_attributes.mobile_phone.value').safeObject,
          day: t(action, 'payload.meta_attributes.day.value').safeObject,
          month: t(action, 'payload.meta_attributes.month.value').safeObject,
          year: t(action, 'payload.meta_attributes.year.value').safeObject,
          loggedIn: true
        })
      }

      return Object.assign({}, initialState, accountObject)

    case types.ERROR_ACCOUNT:
      return Object.assign({}, state, { errors: action.payload.error.data })

    case types.SET_LOGGED_IN:
      return Object.assign({}, state, { loggedIn: true, errors: [] })

    default:
      return state
  }
}
