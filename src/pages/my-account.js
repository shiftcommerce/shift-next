// Libraries
import React, { Component } from 'react'
import Router from 'next/router'
import qs from 'qs'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Components
import {
  AccountAddresses,
  AccountDetails,
  AccountOrders,
  AccountPassword,
  MyAccountHeader,
  Sidebar
} from '@shiftcommerce/shift-react-components'

// Actions
import { getCustomerOrders, updateCustomerAccount } from '../actions/account-actions'

import Config from '../lib/config'

class MyAccountPage extends Component {
  constructor (props) {
    super(props)

    this.state = {}

    this.Head = Config.get().Head
    this.handleClickedMenu = this.handleClickedMenu.bind(this)
  }

  defaultMenus () {
    const { account: { email, firstName, lastName }, orders } = this.props

    return [{
      label: 'Details',
      component: AccountDetails,
      props: {
        email,
        handleSubmit: this.handleUpdateDetailsSubmit.bind(this),
        firstName,
        lastName
      }
    }, {
      label: 'Addresses',
      component: AccountAddresses
    }, {
      label: 'Password',
      component: AccountPassword
    }, {
      label: 'Orders',
      component: AccountOrders,
      props: {
        fetchOrders: this.fetchOrders.bind(this),
        orders
      }
    }]
  }

  componentDidMount () {
    const menus = this.props.menus || this.defaultMenus()
    const [path, queryString] = Router.asPath.split('?')
    const urlMenu = qs.parse(queryString).menu
    const validMenu = menus.some(menu => menu.label.toLowerCase() === (urlMenu && urlMenu.toLowerCase()))

    this.setState({
      currentMenu: validMenu ? urlMenu : menus[0].label
    })

    if (!validMenu) {
      Router.replace(`${path}?menu=${menus[0].label}`)
    }
  }

  fetchOrders () {
    this.props.dispatch(getCustomerOrders())
  }

  renderPageTitle () {
    return (
      <this.Head>
        <title>{ suffixWithStoreName('My Account') }</title>
      </this.Head>
    )
  }

  handleClickedMenu (menu) {
    return () => {
      this.setState({
        currentMenu: menu.label
      })
      Router.push(`${Router.asPath.split('?')[0]}?menu=${menu.label.toLowerCase()}`)
    }
  }

  handleUpdateDetailsSubmit ({ email, firstName, lastName }, { setStatus, setSubmitting }) {
    this.props.dispatch(updateCustomerAccount(email, firstName, lastName)).then(success => {
      // Display a relevant flash message
      setStatus(success ? 'success' : 'error')
      setTimeout(() => {
        // Clear flash message after 5 seconds
        setStatus(undefined)
        // Re-enable the submit button
        setSubmitting(false)
      }, 5000)
    })
  }

  render () {
    const menus = this.props.menus || this.defaultMenus()

    return (
      <>
        { this.renderPageTitle() }
        <MyAccountHeader />
        <Sidebar
          menus={menus}
          currentMenu={this.state.currentMenu}
          handleClickedMenu={this.handleClickedMenu}
        />
      </>
    )
  }
}

export default MyAccountPage
