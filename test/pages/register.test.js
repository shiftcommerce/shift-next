// Libraries
import Router from 'next/router'

// Pages
import RegisterPage from '../../src/pages/register'

// Types
import * as types from '../../src/actions/action-types'

// Actions
import * as registerActions from '../../src/actions/register-actions'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

test('redirects to myaccount page when account is created', () => {
  // Arrange - mock next.js router
  const mockedRouter = { push: jest.fn() }
  Router.router = mockedRouter

  const wrapper = shallow(
    <RegisterPage
      loggedIn={ false }
      registration={{ errors: [] }}
    />
  )

  // Act - pretend a user has just logged in
  wrapper.setProps({ loggedIn: true, errors: {}, validationErrors: [] })

  // Assert - verify that only one redirect happens
  expect(Router.router.push.mock.calls.length).toBe(1)

  // Assert - verify that the redirect goes to the myaccount page
  expect(Router.router.push.mock.calls[0][0]).toBe('/account/myaccount')
})

test('redirects to myaccount page when account already exists', async () => {
  // Arrange - mock Redux store
  const reduxStore = {
    getState: function () {
      return {
        account: {
          loggedIn: true
        }
      }
    }
  }

  // Arrange - mock next.js router
  const mockedRouter = { push: jest.fn() }
  Router.router = mockedRouter

  // Act
  await RegisterPage.getInitialProps({ reduxStore })

  // Assert - verify that only one redirect happens
  expect(Router.router.push.mock.calls.length).toBe(1)

  // Assert - verify that the redirect goes to the myaccount page
  expect(Router.router.push.mock.calls[0][0]).toBe('/account/myaccount')
})

test('redirects to myaccount page when user already logged in', async () => {
  // Arrange - mock Redux store
  const reduxStore = {
    getState: function () {
      return {
        account: {
          loggedIn: true
        },
        login: {
          loggedIn: false
        }
      }
    }
  }

  // Arrange - mock next.js router
  const mockedRouter = { push: jest.fn() }
  Router.router = mockedRouter

  // Act
  await RegisterPage.getInitialProps({ reduxStore })

  // Assert - verify that only one redirect happens
  expect(Router.router.push.mock.calls.length).toBe(1)

  // Assert - verify that the redirect goes to the myaccount page
  expect(Router.router.push.mock.calls[0][0]).toBe('/account/myaccount')
})

test('should clear errors when the page is mounted', () => {
  // Arrange
  const props = {
    registration: {
      errors: [{
        title: 'has already been taken',
        detail: 'email - has already been taken',
        code: '100',
        source: {
          pointer: '/data/attributes/email'
        },
        status: '422'
      }]
    }
  }

  const dispatch = jest.fn()

  // Act
  shallow(
    <RegisterPage registration={props.registration} dispatch={dispatch} />
  )

  // Assert
  expect(dispatch).toHaveBeenCalledWith({
    type: types.CLEAR_ACCOUNT_ERRORS
  })
})

test('should not clear errors when the page is mounted and there are no errors present', () => {
  // Arrange
  const props = {
    registration: {
      errors: []
    }
  }

  const dispatch = jest.fn()

  // Act
  shallow(
    <RegisterPage registration={props.registration} dispatch={dispatch} />
  )

  // Assert
  expect(dispatch).not.toHaveBeenCalledWith({
    type: types.CLEAR_ACCOUNT_ERRORS
  })
})

test('should create an account when submitting the form', () => {
  // Mocks
  const createAccountSpy = jest.spyOn(registerActions, 'createAccount').mockImplementation(() => 'create account response')

  // Arrange
  const props = {
    registration: {
      errors: []
    }
  }
  const dispatch = jest.fn()
  const values = {
    confirmEmail: 'dave@dave.co.uk',
    confirmPassword: 'dmf9B79spvNDUvA',
    email: 'dave@dave.co.uk',
    firstName: 'Dave',
    lastName: 'Dagley',
    password: 'dmf9B79spvNDUvA'
  }

  // Act
  const wrapper = shallow(
    <RegisterPage dispatch={dispatch} registration={props.registration} />
  )
  wrapper.instance().handleSubmit(values)

  // Assert
  expect(dispatch).toHaveBeenCalledWith('create account response')
  expect(createAccountSpy).toHaveBeenCalledTimes(1)
  expect(createAccountSpy).toHaveBeenCalledWith(values)
  createAccountSpy.mockClear()
})

test('should render relevant elements', () => {
  // Arrange
  const props = {
    registration: {
      errors: []
    }
  }
  const dispatch = jest.fn()

  // Act
  const wrapper = shallow(
    <RegisterPage dispatch={dispatch} registration={props.registration} />
  )

  // Assert
  expect(wrapper).toIncludeText('Create your account')
  expect(wrapper.find('a')).toIncludeText('Privacy Policy')
  expect(wrapper.find('RegisterForm').length).toEqual(1)
})
