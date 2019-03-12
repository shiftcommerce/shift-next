// Libraries
import React, { Component } from 'react'
import Link from 'next/link'
import Head from 'next/head'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Components
import { Button, Loading, OrderList } from 'shift-react-components'

// Actions
import { getCustomerOrders } from '../actions/account-actions'

class MyAccountPage extends Component {
  componentDidMount () {
    const { dispatch } = this.props

    dispatch(getCustomerOrders())
  }

  renderOrdersList (orders) {
    if (orders.data.length === 0) {
      return (<p>No previous orders found.</p>)
    }

    return (<OrderList orders={orders} />)
  }

  renderLogout () {
    return (
      <div className='c-order-history__banner-button'>
        <Link href='/account/logout'>
          <Button
            aria-label='Logout'
            className='c-order-history__banner-button-icon o-button--sml'
            label='Logout'
            status='secondary'
          />
        </Link>
      </div>
    )
  }

  renderAccountBanner () {
    return (
      <>
        <div className='c-order-history__banner'>
          <h1>My Account</h1>
          { this.renderLogout() }
        </div>
        <div className='c-order-history__nav'>
          <h2>Order History</h2>
        </div>
      </>
    )
  }

  renderPageTitle () {
    return (
      <Head>
        <title>{ suffixWithStoreName('My Account') }</title>
      </Head>
    )
  }

  render () {
    const { orders, orders: { loading } } = this.props

    if (loading) {
      return (
        <>
          { this.renderPageTitle() }
          <div className='c-order-history'>
            { this.renderAccountBanner() }
            <Loading />
          </div>
        </>
      )
    } else {
      return (
        <>
          { this.renderPageTitle() }
          <div className='c-order-history'>
            { this.renderAccountBanner() }
            { this.renderOrdersList(orders) }
          </div>
        </>
      )
    }
  }
}

export default MyAccountPage
