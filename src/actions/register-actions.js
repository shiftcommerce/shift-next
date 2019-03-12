// actionTypes
import * as actionTypes from './action-types'

// Actions
import { postEndpoint } from './api-actions'

function registerPayload (account) {
  return {
    data: {
      type: 'customer_accounts',
      attributes: {
        email: account.email,
        email_confirmation: account.confirmEmail,
        password: account.password,
        password_confirmation: account.confirmPassword,
        meta_attributes: {
          first_name: { value: account.firstName },
          last_name: { value: account.lastName }
        }
      }
    }
  }
}

export function createAccount (account) {
  const request = {
    endpoint: '/register',
    body: registerPayload(account),
    requestActionType: actionTypes.CREATE_ACCOUNT,
    successActionType: actionTypes.SET_ACCOUNT,
    errorActionType: actionTypes.ERROR_REGISTRATION
  }
  return postEndpoint(request)
}
