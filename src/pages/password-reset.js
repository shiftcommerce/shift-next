// Libraries
import React, { Component } from 'react'
import Head from 'next/head'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Objects
import { Button, Input } from '@shiftcommerce/shift-react-components'

// Actions
import { passwordReset } from '../actions/account-actions'

export class PasswordReset extends Component {
  constructor (props) {
    super(props)
    this.state = { value: '' }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  static async getInitialProps ({ query }) {
    return { token: query.token }
  }

  handleChange (event) {
    this.setState({ value: event.target.value })
  }

  handleSubmit (event) {
    event.preventDefault()
    this.props.dispatch(passwordReset(this.props.token, this.state.value))
  }

  renderSubmitButton () {
    return (
      <div className='o-form__input-group'>
        <Button
          className='c-password-reset__button o-button-sml'
          aria-label='Submit'
          label='SUBMIT'
          status='primary'
          type='submit'
        />
      </div>
    )
  }

  render () {
    return (
      <>
        <Head>
          <title>{ suffixWithStoreName('Password Reset') }</title>
        </Head>
        <div className='c-password-reset'>
          <h1 className='c-password-reset__title'>Password Reset</h1>
          <p className='c-password-reset__caption'>Please enter your new password</p>
          <form onSubmit={this.handleSubmit}>
            <Input
              label='New Password:'
              className='o-form__input-block'
              name='new password'
              value={this.state.value}
              onChange={this.handleChange}
            />
            <div className='c-password-reset__button'>
              { this.renderSubmitButton() }
            </div>
          </form>
        </div>
      </>
    )
  }
}

export default PasswordReset
