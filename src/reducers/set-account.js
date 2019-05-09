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
        const dateOfBirth = t(action, 'payload.meta_attributes.date_of_birth.value').safeString.split('/')

        accountObject = Object.assign(initialState, {
          email: action.payload.email,
          firstName: action.payload.meta_attributes.first_name.value,
          lastName: action.payload.meta_attributes.last_name.value,
          mobilePhone: t(action, 'payload.meta_attributes.mobile_phone.value').safeString,
          day: t(dateOfBirth[0]).safeString,
          month: t(dateOfBirth[1]).safeString,
          year: t(dateOfBirth[2]).safeString,
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
