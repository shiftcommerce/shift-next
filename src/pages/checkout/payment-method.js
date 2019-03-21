// Libraries
import React, { Component } from 'react'
import Router from 'next/router'

// Actions
import { 
  setPaymentMethod,
  setCheckoutShippingAddress,
  setCheckoutBillingAddress
} from '../../actions/checkout-actions'

import { 
  setCartBillingAddress,
  createBillingAddress,
  setCartShippingAddress,
  createShippingAddress
} from '../../actions/cart-actions'

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
        // currency is specified in the PayPal SDK script
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
      const shippingDetails = order.purchase_units[0].shipping
      const splitShippingFullName = shippingDetails.name.full_name.split(' ')
      this.handleBillingAddressCreation(
        this.parsePayPalAddress(
          order.payer.given_name,
          order.payer.surname,
          payer.email_address,
          payer.phone.phone_number.national_number,
          payer.address)
      )
      this.handleShippingAddressCreation(
        this.parsePayPalAddress(
          splitShippingFullName.slice(0, -1).join(' '),
          splitShippingFullName.slice(-1).join(' '),
          payer.email_address,
          '',
          shippingDetails.address
        )
      )
    })
  }

  /**
   * Parses the PayPal address into the expected format
   * @param  {string} first_name
   * @param  {string} last_name
   * @param  {string} email
   * @param  {string} phone_number
   * @param  {object} address
   */
  parsePayPalAddress(first_name, last_name, email, phone_number, address) {
    return {
      first_name: first_name,
      last_name: last_name,
      email: email,
      line_1: address.address_line_1,
      line_2: address.address_line_2,
      city: address.admin_area_2,
      state: address.admin_area_1,
      zipcode: address.postal_code,
      country_code: address.country_code,
      primary_phone: phone_number,
      collapsed: true,
      completed: true
    }
  }

  /**
   * Handles the creation of new billing addresses
   * @param  {object} newBillingAddress
   */
  handleBillingAddressCreation (newBillingAddress) {
    const { dispatch, checkout } = this.props
    // set new address in state
    return dispatch(setCheckoutBillingAddress(newBillingAddress)).then(() => {
      // create shipping address
      return dispatch(createBillingAddress(checkout.billingAddress)).then(() => {
        // set the created shipping address ID in state
        return dispatch(setCartBillingAddress(checkout.billingAddress.id))
      })
    })
  }

  /**
   * Handles the creation of new shipping addresses
   * @param  {object} newShippingAddress
   */
  handleShippingAddressCreation (newShippingAddress) {
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
