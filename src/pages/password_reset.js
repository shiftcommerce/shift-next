// Libraries
import React, { Component } from 'react'
import Head from 'next/head'
import Router from 'next/router'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Component
import { PasswordResetForm } from '@shiftcommerce/shift-react-components'

// Actions
import { passwordReset } from '../actions/account-actions'

export class PasswordReset extends Component {
  constructor (props) {
    super(props)

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

  render () {
    const { account } = this.props

    return (
      <>
        <Head>
          <title>{ suffixWithStoreName('Password Reset') }</title>
        </Head>
        <PasswordResetForm handleSubmit={this.handleSubmit} account={account} />
      </>
    )
  }
}

export default PasswordReset
