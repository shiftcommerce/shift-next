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

  /**
   * Returns route for next checkout section  
   */
  nextSection () {
    Router.push('/checkout/shipping-address')
  }

  /**
   * Sets the current checkout page title  
   */
  pageTitle = () => 'Payment Method'


  /**
   * Sets the current checkout page step 
   */
  currentStep = () => 1

  /**
   * Sets the current checkout page step 
   */
  continueButtonProps () {
    return null
  }

  /**
   * When a payment method is selected, this funtion is called and 
   * it sets the current payment method in the state
   * @param  {object} paymentMethod
   */
  handleSetPaymentMethod (paymentMethod) {
    this.props.dispatch(setPaymentMethod(paymentMethod))
    this.setState({ selectedPaymentMethod: paymentMethod })
  }

  /**
   * When the buyer clicks the PayPal button, this function is called and
   * it handles the creation of the order 
   * @param  {object} data
   * @param  {object} actions
   */
  paypalCreateOrder(data, actions) {
    const { cart } = this.props
    this.handleSetPaymentMethod ('paypal')

    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'GBP',
          value: cart.total
        }
      }]
    })
  }

  /**
   * After the cusrtomer approves the transaction on paypal.com, 
   * this function is called and it retrieves the transaction details
   * @param  {object} data
   * @param  {object} actions
   */
  paypalOnApprove(data, actions) {
    return actions.order.get().then((details) =>
      // @TODO - extract shipping address data & set data in state
      alert('Transaction completed by ' + details.payer.name.given_name)
    )
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
