// Libraries
import React, { Component } from 'react'
import Router from 'next/router'

// Actions
import {
  setPaymentMethod
} from '../../actions/checkout-actions'

// Components
import {
  PaymentMethods
} from '@shiftcommerce/shift-react-components'

// Lib
import Config from '../../lib/config'

export class PaymentMethodPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.nextSection = this.nextSection.bind(this)
    this.paypalCreateOrder = this.paypalCreateOrder.bind(this)
    this.paypalOnApprove = this.paypalOnApprove.bind(this)
    this.handleSetPaymentMethod = this.handleSetPaymentMethod.bind(this)
  }

  nextSection () {
    Router.push('/checkout/shipping-address')
  }

  pageTitle = () => 'Payment Method'

  currentStep = () => 1

  continueButtonProps () {
    return null
  }

  paypalCreateOrder(data, actions) {
    const { cart } = this.props
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'GBP',
          value: cart.total
        }
      }]
    })
  }

  paypalOnApprove(data, actions) {
    // @TODO - extract shipping address data
    return actions.order.get()
  }

  handleSetPaymentMethod (paymentMethod) {
    this.props.dispatch(setPaymentMethod(paymentMethod))
    this.setState({ selectedPaymentMethod: paymentMethod })
  }

  render () {
    return (
      <div>
        { this.state.loading ? <p>Loading...</p> : <PaymentMethods
          nextSection={this.nextSection}
          paypalClientID={ Config.get().paypalClientID }
          paypalCreateOrder={this.paypalCreateOrder}
          paypalOnApprove={this.paypalOnApprove}
          handleSetPaymentMethod={this.handleSetPaymentMethod}
        /> }
      </div>
    )
  }
}

export default PaymentMethodPage
