// Libraries
import React from 'react'
import Router from 'next/router'

// Pages
import PasswordResetPage from '../../src/pages/password_reset'

// Actions
import * as accountActions from '../../src/actions/account-actions'

test('handleSubmit dispatches the action to reset password', async () => {
  // Mocks
  const passwordResetSpy = jest.spyOn(accountActions, 'passwordReset').mockImplementation(() => 'password reset response')

  // Arrange
  const props = {
    account: {
      errors: []
    },
    token: 'dmf9B79spvNDUvA303030303'
  }

  const dispatch = jest.fn().mockImplementation(() => Promise.resolve(true))

  const values = {
    password: 'dmf9B79spvNDUvA',
    confirmPassword: 'dmf9B79spvNDUvA'
  }

  // Act
  const wrapper = shallow(
    <PasswordResetPage dispatch={dispatch} account={props.account} token={props.token} />
  )
  wrapper.instance().handleSubmit(values)

  // Assert
  expect(dispatch).toHaveBeenCalledWith('password reset response')
  expect(passwordResetSpy).toHaveBeenCalledTimes(1)
  expect(passwordResetSpy).toHaveBeenCalledWith('dmf9B79spvNDUvA303030303', 'dmf9B79spvNDUvA')

  passwordResetSpy.mockClear()
})
