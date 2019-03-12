import nock from 'nock'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as registerActions from '../../src/actions/register-actions'
import * as actionTypes from '../../src/actions/action-types'

afterEach(() => { nock.cleanAll() })

test('return ERROR_REGISTRATION action type if errors are returned from API', () => {
  // Arrange
  const middlewares = [thunk]
  const mockStore = configureMockStore(middlewares)

  const errorData = {
    title: 'is too short (minimum is 8 characters)',
    detail: 'password - is too short (minimum is 8 characters)',
    code: '100',
    source: {
      pointer: '/data/attributes/password'
    },
    status: '422'
  }

  nock('http://localhost')
    .post('/register')
    .reply(404, errorData)

  const account = {
    email: 'homersimpson@test.com',
    confirmEmail: 'homersimpson@test.com',
    password: 'qwerty',
    confirmPassword: 'qwerty',
    firstName: 'Homer',
    lastName: 'Simpson'
  }

  const store = mockStore({
    registration: {
      errors: []
    }
  })

  const expectedActions = [
    {
      type: actionTypes.CREATE_ACCOUNT,
      data: undefined
    },
    {
      type: actionTypes.ERROR_REGISTRATION,
      payload: { error: { data: errorData } }
    }
  ]

  // Act
  return store.dispatch(registerActions.createAccount(account))
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
})
