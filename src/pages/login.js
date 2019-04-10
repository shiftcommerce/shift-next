// Libraries
import React, { Component } from 'react'
import Link from 'next/link'
import Router from 'next/router'

// Libs
import { setCookie } from '../lib/set-cookie'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Actions
import { createLogin } from '../actions/login-actions'
import { clearErrors, fetchAccountDetails } from '../actions/account-actions'

// Components
import { LoginForm } from '@shiftcommerce/shift-react-components'

// Config
import Config from '../lib/config'

class LoginPage extends Component {
  constructor () {
    super()

    this.Head = Config.get().Head
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount () {
    if (this.props.login.errors.length > 0) {
      this.props.dispatch(clearErrors())
    }
  }

  static async getInitialProps ({ reduxStore }) {
    // Redirect to myaccount if already logged in
    const { account: { loggedIn } } = reduxStore.getState()
    if (loggedIn) Router.push('/account/myaccount')
    return {}
  }

  handleSubmit (login) {
    this.props.dispatch(createLogin(login))
      .then(success => {
        if (success) {
          this.props.dispatch(fetchAccountDetails()).then(() => {
            setCookie()
            Router.push('/account/myaccount')
          })
        }
      })
  }

  render () {
    return (
      <>
        <this.Head>
          <title>{ suffixWithStoreName('Login') }</title>
        </this.Head>
        <div className='c-login'>
          <h1 className='c-login__title'>Login</h1>
          <p className='c-login__caption'>Please enter your details below.</p>
          <LoginForm {...this.props}
            title='Login'
            formName='loginForm'
            handleSubmit={this.handleSubmit}
          />
          <a href='/account/forgotpassword' className='c-login__anchor'>Reset Password?</a>
          <p className='c-login__caption'>Don't have an account?</p>
          <Link href='/account/register'>
            <a className='c-login__register-button'>create new account</a>
          </Link>
        </div>
      </>
    )
  }
}

export default LoginPage
