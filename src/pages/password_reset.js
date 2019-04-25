// Libraries
import React, { Component, Fragment } from 'react'
import Router from 'next/router'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Component
import { PasswordResetForm } from '@shiftcommerce/shift-react-components'

// Actions
import { passwordReset } from '../actions/account-actions'

// Config
import Config from '../lib/config'

export class PasswordReset extends Component {
  constructor (props) {
    super(props)

    this.Head = Config.get().Head
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  static async getInitialProps({ query }) {
    return { token: query.token }
  }

  handleSubmit (values) {
    this.props.dispatch(passwordReset(this.props.token, values.password))
      .then(success => {
        if (success) {
          Router.push('/account/login')
        }
      })
  }

  renderLoaded (account) {
    return <PasswordResetForm account={account} handleSubmit={this.handleSubmit} />
  }

  render () {
    const { account } = this.props

    return (
      <Fragment>
        <this.Head>
          <title>{ suffixWithStoreName('Password Reset') }</title>
        </this.Head>
        { this.renderLoaded(account) }
      </Fragment>
    )
  }
}

export default PasswordReset
