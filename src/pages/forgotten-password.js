// Libraries
import React, { Component } from 'react'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Component
import { ForgotPasswordForm } from '@shiftcommerce/shift-react-components'

// Actions
import { requestPasswordResetEmail } from '../actions/account-actions'

// Config
import Config from '../lib/config'

export class ForgottenPassword extends Component {
  constructor (props) {
    super(props)
    this.state = { flashMessage: false }

    this.Head = Config.get().Head
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
        <this.Head>
          <title>{ suffixWithStoreName('Reset Password') }</title>
        </this.Head>
        <ForgotPasswordForm handleSubmit={this.handleSubmit} flashMessage={this.state.flashMessage} account={account} />
      </>
    )
  }
}

export default ForgottenPassword
