// Libraries
import React, { Component } from 'react'
import Head from 'next/head'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Objects
import { Button, Input } from '@shiftcommerce/shift-react-components'

// Actions
import { requestPasswordResetEmail } from '../actions/account-actions'

export class ForgottenPassword extends Component {
  constructor (props) {
    super(props)
    this.state = { value: '' }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  renderFormSubmitButton () {
    return (
      <div className='o-form__input-group'>
        <Button
          className='c-password__button-icon o-button-sml'
          aria-label='Submit'
          label='SUBMIT'
          status='primary'
          type='submit'
        />
      </div>
    )
  }

  handleChange (event) {
    this.setState({ value: event.target.value })
  }

  handleSubmit (event) {
    event.preventDefault()
    this.props.dispatch(requestPasswordResetEmail(this.state.value))
  }

  render () {
    return (
      <>
        <Head>
          <title>{ suffixWithStoreName('Reset Password') }</title>
        </Head>
        <div className='c-password'>
          <h1 className='c-password__title'>Forgot Password</h1>
          <p className='c-password__caption'>Please enter your email address and submit. In doing this an email containing a special link will be mailed to you. Once received, click on this link and you will then have the opportunity to enter a new password.</p>
          <form onSubmit={this.handleSubmit}>
            <Input
              label='Email:'
              className='o-form__input-block'
              name='email'
              value={this.state.value}
              onChange={this.handleChange}
            />
            <div className='c-password__button'>
              { this.renderFormSubmitButton() }
            </div>
          </form>
        </div>
      </>
    )
  }
}

export default ForgottenPassword
