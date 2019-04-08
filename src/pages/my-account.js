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
import { getCustomerOrders, updateCustomerAccount } from '../actions/account-actions'
import { fetchAddressBook, saveToAddressBook } from '../actions/address-book-actions'

class MyAccountPage extends Component {
  constructor (props) {
    super(props)

    this.state = {}

    this.handleClickedMenu = this.handleClickedMenu.bind(this)
  }

  defaultMenus () {
    const { account: { email, firstName, lastName }, addressBook, orders } = this.props
    const { addingNewAddress, currentAddressId } = this.state

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
      component: AccountAddresses,
      props: {
        addingNewAddress,
        addressBook,
        currentAddress: currentAddressId && addressBook.find(a => a.id === currentAddressId),
        onBookAddressSelected: this.onBookAddressSelected.bind(this),
        onNewAddress: this.onNewAddress.bind(this),
        onAddressCreated: this.onAddressCreated.bind(this)
      }
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

    this.props.dispatch(fetchAddressBook())
  }

  onBookAddressSelected (id) {
    this.setState({
      addingNewAddress: false,
      currentAddressId: id
    })
  }

  onNewAddress () {
    this.setState({
      addingNewAddress: true,
      currentAddressId: null
    })
  }

  onAddressCreated (form, { setStatus, setSubmitting }) {
    const newAddress = {
      first_name: form.firstName,
      last_name: form.lastName,
      line_1: form.addressLine1,
      line_2: form.addressLine2,
      city: form.city,
      state: form.county,
      country_code: form.countryCode,
      zipcode: form.postcode,
      preferred_billing: form.preferredBilling,
      preferrered_shipping: form.preferredShipping,
      label: form.label,
      companyName: form.company,
      primary_phone: form.phone,
      email: form.email
    }

    this.props.dispatch(saveToAddressBook(newAddress)).then(success => {
      if (success) {
        this.props.dispatch(fetchAddressBook())
        this.setState({
          addingNewAddress: false
        })
      }
      window.scrollTo(0, 0)
      setStatus(success ? 'success-created' : 'error')
      setTimeout(() => {
        // Clear flash message after 5 seconds
        setStatus(undefined)
        // Re-enable the submit button
        setSubmitting(false)
      }, 5000)
    })
  }

  onAddressUpdated () {

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
