// Libraries
import React from 'react'

// Pages
import ForgottenPasswordPage from '../../src/pages/forgotten-password'

// Actions
import * as accountActions from '../../src/actions/account-actions'

test('handleSubmit dispatches the action and then redirects on success', async () => {
  // Mocks
  const passwordResetSpy = jest.spyOn(accountActions, 'requestPasswordResetEmail').mockImplementation(() => 'password reset email sent' )

  // Arrange
  const props = {
    account: {
      errors: []
    }
  }

  const dispatch = jest.fn()

  const values = {
    email: 'dave@dave.co.uk'
  }

  // Act
  const wrapper = shallow(
    <ForgottenPasswordPage dispatch={dispatch} account={props.account} />
  )
  wrapper.instance().handleSubmit(values)

  // Assert
  expect(dispatch).toHaveBeenCalledWith('password reset email sent')
  expect(passwordResetSpy).toHaveBeenCalledTimes(1)
  expect(passwordResetSpy).toHaveBeenCalledWith('dave@dave.co.uk')
  passwordResetSpy.mockClear()
})
