// Libraries
import React, { Component } from 'react'
import Head from 'next/head'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Objects
import { Button, Input, PasswordResetForm } from '@shiftcommerce/shift-react-components'

// Actions
import { passwordReset } from '../actions/account-actions'

export class PasswordReset extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  static async getInitialProps ({ query }) {
    return { token: query.token }
  }

  handleSubmit (values) {
    this.props.dispatch(passwordReset(this.props.token, values.password))
  }

  renderSubmitButton () {
    return (
      <div className='o-form__input-group'>
        <Button
          className='c-password-reset__button o-button-sml'
          aria-label='Submit'
          label='submit'
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
        <PasswordResetForm handleSubmit={this.handleSubmit} />
      </>
    )
  }
}

export default PasswordReset
