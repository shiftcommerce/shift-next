import setLogin, { initialState } from '../../src/reducers/set-login'
import * as actionTypes from '../../src/actions/action-types'

test('fills state with errors when ERROR_LOGIN action is called', () => {
  // Arrange
  const errors = {
    error: {
      data: [
        {
          title: 'Record not found',
          detail: 'Wrong email/reference/token or password',
          code: '404',
          status: '404'
        }
      ]
    }
  }

  const payload = {
    type: actionTypes.ERROR_LOGIN,
    payload: errors
  }

  const expectResults = Object.assign({}, initialState, { errors: errors.error.data })

  // Act
  const result = setLogin(initialState, payload)

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
  const result = setLogin(state, payload)

  // Assert
  expect(result).toEqual(expectResults)
})
