import setRegistration, { initialState } from '../../src/reducers/set-registration'
import * as actionTypes from '../../src/actions/action-types'

test('fills state with errors when ERROR_LOGIN action is called', () => {
  // Arrange
  const errors = {
    error: {
      data: [
        {
          title: 'is too short (minimum is 8 characters)',
          detail: 'password - is too short (minimum is 8 characters)',
          code: '100',
          source: {
            pointer: '/data/attributes/password'
          },
          status: '422'
        }
      ]
    }
  }

  const payload = {
    type: actionTypes.ERROR_REGISTRATION,
    payload: errors
  }

  const expectResults = Object.assign({}, initialState, { errors: errors.error.data })

  // Act
  const result = setRegistration(initialState, payload)

  // Assert
  expect(result).toEqual(expectResults)
})

test('clears errors in state when CLEAR_ACCOUNT_ERRORS is called', () => {
  // Arrange
  const state = {
    errors: [
      {
        title: 'Record not found',
        detail: 'Wrong email/reference/token or password',
        code: '404',
        status: '404'
      }
    ]
  }

  const payload = {
    type: actionTypes.CLEAR_ACCOUNT_ERRORS
  }

  const expectResults = Object.assign({}, initialState, { errors: [] })

  // Act
  const result = setRegistration(state, payload)

  // Assert
  expect(result).toEqual(expectResults)
})
