// Libraries
import React, { Component } from 'react'
import Router from 'next/router'

// Actions
import { setPaymentMethod, setCheckoutShippingAddress } from '../../actions/checkout-actions'
import { setCartShippingAddress, createShippingAddress } from '../../actions/cart-actions'

// Components
import { PaymentMethods } from '@shiftcommerce/shift-react-components'

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
    return actions.order.create({
      purchase_units: [{
        amount: {
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
    return actions.order.get().then((order) => {
      const payer = order.payer
      const shippingAddress = order.shipping_detail.address
      this.handleShippingAddressCreation({
        first_name: payer.name.given_name,
        last_name: payer.name.surname,
        email: payer.email_address,
        line_1: shippingAddress.address_line_1,
        line_2: shippingAddress.address_line_2,
        city: shippingAddress.admin_area_2,
        state: shippingAddress.admin_area_1,
        zipcode: shippingAddress.postal_code,
        country_code: shippingAddress.country_code,
        collapsed: true,
        completed: true
      })
    })
  }

  /**
   * Handles the creation of new shipping addresses
   * @param  {object} newShippingAddress
   */
  handleShippingAddressCreation(newShippingAddress) {
    const { dispatch, checkout } = this.props
    // set new address in state
    return dispatch(setCheckoutShippingAddress(newShippingAddress)).then(() => {
      // create shipping address
      return dispatch(createShippingAddress(checkout.shippingAddress)).then(() => {
        // set the created shipping address ID in state
        return dispatch(setCartShippingAddress(checkout.shippingAddress.id)).then(() => {
          // redirect to shipping method checkout step
          Router.push('/checkout/shipping-method')
        })
      })
    })
  }

  render () {
    return (
      <div>
        { this.state.loading ? <p>Loading...</p> : <PaymentMethods
          nextSection={this.nextSection}
          paypalCreateOrder={this.paypalCreateOrder}
          paypalOnApprove={this.paypalOnApprove}
          handleSetPaymentMethod={this.handleSetPaymentMethod}
        /> }
      </div>
    )
  }
}

export default PaymentMethodPage
