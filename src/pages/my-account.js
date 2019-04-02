// Libraries
import React, { Component } from 'react'
import Head from 'next/head'
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
import { getCustomerOrders } from '../actions/account-actions'

class MyAccountPage extends Component {
  constructor (props) {
    super(props)

    this.state = {}

    this.handleClickedMenu = this.handleClickedMenu.bind(this)
  }

  defaultMenus () {
    return [{
      label: 'Details',
      component: AccountDetails
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
        orders: this.props.orders
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
      <Head>
        <title>{ suffixWithStoreName('My Account') }</title>
      </Head>
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
