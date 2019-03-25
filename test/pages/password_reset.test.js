// Libraries
import React from 'react'
import { mount } from 'enzyme'

// Pages
import PasswordResetPage from '../../src/pages/password_reset'

// InitialState
import { initialState } from '../../src/reducers/set-account'

test('renders the password reset form', () => {
  const wrapper = mount(<PasswordResetPage account={initialState} />)

  expect(wrapper).toMatchSnapshot()
  expect(wrapper).toIncludeText('Password Reset')
  expect(wrapper).toContainMatchingElement('input')
  expect(wrapper).toContainMatchingElement('button')
})
