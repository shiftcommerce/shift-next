import setAccount from '../../src/reducers/set-account'
import * as actionTypes from '../../src/actions/action-types'

test('sets loggedIn to true and adds account details to state on SET_ACCOUNT', () => {
  const action = {
    type: actionTypes.SET_ACCOUNT,
    payload: {
      meta_attributes: {
        first_name: {
          value: 'John'
        },
        last_name: {
          value: 'Smith'
        }
      },
      email: 'email@example.com'
    }
  }

  const result = setAccount({ loggedIn: false }, action)

  expect(result).toEqual({
    loggedIn: true,
    errors: [],
    firstName: 'John',
    lastName: 'Smith',
    email: 'email@example.com'
  })
})

test('sets loggedIn to true on SET_LOGGED_IN', () => {
  const action = {
    type: actionTypes.SET_LOGGED_IN
  }

  const result = setAccount({ loggedIn: false }, action)

  expect(result).toEqual({
    loggedIn: true,
    errors: []
  })
})

test('adds errors to state on ERROR_ACCOUNT', () => {
  const action = {
    type: actionTypes.ERROR_ACCOUNT,
    payload: {
      error: {
        data: 'Error data'
      }
    }
  }

  const result = setAccount({}, action)

  expect(result).toEqual({
    errors: 'Error data'
  })
})

test("doesn't modify the state when given an unrecognized action", () => {
  const action = {
    type: 'UNRECOGNIZED',
    payload: { key: 'value' }
  }

  const result = setAccount({}, action)

  expect(result).toEqual({})
})
