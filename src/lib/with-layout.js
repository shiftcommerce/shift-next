// Lib
import React from 'react'
import qs from 'qs'

// Config
import Config from './config'
import InitialPropsDelegator from './initial-props-delegator'

// Components
import { Layout } from '@shiftcommerce/shift-react-components'

// Actions
import { readCart, deleteLineItem, toggleMiniBag, updateLineItemQuantity } from '../actions/cart-actions'

import { connect } from 'react-redux'
import { withRouter } from 'next/router'

export default function withLayout (Component) {
  class LayoutWrapper extends InitialPropsDelegator(Component) {
    // serviceWorker () {
    //  // Install service worker only in production environment
    //   if (process.env.NODE_ENV === 'production') {
    //    // Registration of service worker
    //     if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    //       navigator.serviceWorker.getRegistration('/app').then(registration => {
    //        // Check if service worker has already registered
    //        // register only if not yet done
    //         if (registration === undefined) {
    //           navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' }).then(registration => {
    //            // Successfully registered the Service Worker
    //             console.log('Service Worker registration successful with scope: ', registration.scope)
    //           }).catch(err => {
    //            // Failed to register the Service Worker
    //             console.log('Service Worker registration failed: ', err)
    //           })
    //         }
    //       })
    //     } else {
    //       console.log('Service workers are not supported.')
    //     }
    //   }
    // }
    constructor (props) {
      super(props)

      this.state = {
        shrunk: false,
        toggleShowClass: false
      }

      this.handleScroll = this.handleScroll.bind(this)
      this.toggleDropDown = this.toggleDropDown.bind(this)
      this.onCategoryFilterCleared = this.onCategoryFilterCleared.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.toggleMiniBag = this.toggleMiniBag.bind(this)
      this.onItemQuantityUpdated = this.onItemQuantityUpdated.bind(this)
    }

    componentDidMount () {
      window.addEventListener('scroll', this.handleScroll)

      // for the minibag
      if (this.props.dispatch) {
        this.props.dispatch(readCart())
      }
    }

    componentWillUnmount () {
      window.removeEventListener('scroll', this.handleScroll)
    }

    handleScroll () {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const { shrunk } = this.state

      if (scrollTop > 40 && !shrunk) {
        this.setState({ shrunk: true })
      } else if (scrollTop <= 40 && shrunk) {
        this.setState({ shrunk: false })
      }
    }

    toggleDropDown () {
      this.setState({ toggleShowClass: !this.state.toggleShowClass })
    }

    toggleMiniBag (displayed) {
      this.props.dispatch(toggleMiniBag(displayed))
    }

    deleteItem (event) {
      this.props.dispatch(deleteLineItem(event.target.dataset.id))
    }

    onItemQuantityUpdated (event) {
      this.props.dispatch(updateLineItemQuantity(event.target.dataset.id, parseInt(event.target.value, 10)))
    }

    onCategoryFilterCleared () {
      // If the user removed the category filter from the search box
      // clear any filters redirect to the search page
      const router = this.props.router
      const query = qs.parse(window.location.search.slice(1)).query
      router.push(`/search?${qs.stringify({ query })}`)
    }

    render () {
      const { cart, router, query, search, menu, loggedIn, ...otherProps } = this.props
      const skipHeader = !router.pathname.includes('/checkout')
      const AppLayout = Config.get().Layout || Layout

      return (
        <AppLayout
          cart={cart}
          menu={menu}
          onCategoryFilterCleared={this.onCategoryFilterCleared}
          query={query}
          search={search}
          shrunk={this.state.shrunk}
          skipHeader={skipHeader}
          toggleDropDown={this.toggleDropDown}
          showClass={this.state.toggleShowClass}
          loggedIn={loggedIn}
          deleteItem={this.deleteItem}
          toggleMiniBag={this.toggleMiniBag}
          onItemQuantityUpdated={this.onItemQuantityUpdated}
        >
          <Component {...otherProps} />
        </AppLayout>
      )
    }
  }

  function mapStateToProps ({ cart, account: { loggedIn }, menu, search }) {
    return { cart, loggedIn, menu, search }
  }

  return connect(mapStateToProps)(withRouter(LayoutWrapper))
}
