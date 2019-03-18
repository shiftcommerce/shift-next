// Libraries
import React, { Component } from 'react'
import Router from 'next/router'

// // Components
import {
  PaymentMethods
} from '@shiftcommerce/shift-react-components'

export class PaymentMethodPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false
    }
    this.nextSection = this.nextSection.bind(this)
  }

  nextSection () {
    Router.push('/checkout/shipping-address')
  }

  pageTitle = () => 'Payment Method'

  currentStep = () => 1

  continueButtonProps () {
    return null
  }

  render () {
    const { cart } = this.props

    return (
      <div>
        { this.state.loading ? <p>Loading...</p> : <PaymentMethods 
          cart={cart}
          nextSection={this.nextSection}
          className='u-margin-top-l-des u-margin-top-l-mobtab u-margin-top-l-tab u-margin-top-l-mob'
        /> }
      </div>
    )
  }
}

export default PaymentMethodPage
