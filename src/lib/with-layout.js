// Lib
import React from 'react'
import InitialPropsDelegator from './initial-props-delegator'

// Components
import { Layout } from '@shiftcommerce/shift-react-components'

// Actions
import { readCart } from '../actions/cart-actions'

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
      const toggleShow = this.state.toggleShowClass
      this.setState({ toggleShowClass: !toggleShow })
    }

    render () {
      const { router, ...otherProps } = this.props
      const skipHeader = !router.pathname.includes('/checkout')

      return (
        <Layout
          shrunk={this.state.shrunk}
          skipHeader={skipHeader}
          toggleDropDown={this.toggleDropDown}
          showClass={this.state.toggleShowClass}
          {...this.props}
        >
          <Component {...otherProps} />
        </Layout>
      )
    }
  }

  function mapStateToProps ({ cart, account: { loggedIn }, menu }) {
    return { cart, loggedIn, menu }
  }

  return connect(mapStateToProps)(withRouter(LayoutWrapper))
}
