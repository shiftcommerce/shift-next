// Libraries
import React, { Component } from 'react'
import Head from 'next/head'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Component
import { ForgotPasswordForm } from '@shiftcommerce/shift-react-components'

// Actions
import { requestPasswordResetEmail } from '../actions/account-actions'

export class ForgottenPassword extends Component {
  constructor (props) {
    super(props)
    this.state = { flashMessage: false }

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (values) {
    this.props.dispatch(requestPasswordResetEmail(values.email))
    this.setState({ flashMessage: true })
  }

  render () {
    const { account } = this.props

    return (
      <>
        <Head>
          <title>{ suffixWithStoreName('Reset Password') }</title>
        </Head>
        <ForgotPasswordForm handleSubmit={this.handleSubmit} flashMessage={this.state.flashMessage} account={account} />
      </>
    )
  }
}

export default ForgottenPassword
