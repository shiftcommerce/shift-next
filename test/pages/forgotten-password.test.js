// Libraries
import React from 'react'
import { mount } from 'enzyme'

// Pages
import ForgottenPasswordPage from '../../src/pages/forgotten-password'

test('renders the password reset form', () => {
  const wrapper = mount(<ForgottenPasswordPage />)

  expect(wrapper).toIncludeText('Forgot Password')
  expect(wrapper).toContainMatchingElement('input')
  expect(wrapper).toContainMatchingElement('button')
})
