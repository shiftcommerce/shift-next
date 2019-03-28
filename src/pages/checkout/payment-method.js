// Libraries
import React, { Component } from 'react'
import Router from 'next/router'
import Cookies from 'js-cookie'

// Actions
import { 
  setPaymentMethod,
  setCheckoutShippingAddress,
  setCheckoutBillingAddress,
  setPayPalOrderDetails
} from '../../actions/checkout-actions'

import { 
  setCartBillingAddress,
  createBillingAddress,
  setCartShippingAddress,
  createShippingAddress
} from '../../actions/cart-actions'

// Components
import { PaymentMethods, Loading } from '@shiftcommerce/shift-react-components'

export class PaymentMethodPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.nextSection = this.nextSection.bind(this)
    this.payPalCreateOrder = this.payPalCreateOrder.bind(this)
    this.payPalOnApprove = this.payPalOnApprove.bind(this)
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
   * Returns the props for the continueButton
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
    // set PayPal paymentMethod in a cookie
    Cookies.set('paymentMethod', paymentMethod, { signed: true })
    this.props.dispatch(setPaymentMethod(paymentMethod))
  }

  /**
   * When the buyer clicks the PayPal button, this function is called and
   * it handles the creation of the order 
   * @param  {object} data
   * @param  {object} actions
   */
  payPalCreateOrder(data, actions) {
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
  payPalOnApprove(data, actions) {
    return actions.order.get().then((order) => this.handlePayPalOrderResponse(order))
  }

  /**
   * Handles data for the fetched PayPal Order 
   * @param  {object} order
   */
  handlePayPalOrderResponse (order) {
    const payer = order.payer
    const payerEmail = payer.email_address
    const payerPhone = payer.phone
    const payerPhoneNumber = (payerPhone && payerPhone.phone_number ? payerPhone.phone_number.national_number : '')
    const shippingDetails = order.purchase_units[0].shipping
    const shippingFullName = shippingDetails.name.full_name.split(' ')
    // set loading to true as we handle the order information
    this.setState({ loading: true })
    // handle basic order details - id, intent, status + create_time
    this.handlePayPalOrderDetails(order)
    // handle parsing + setting of billing address in state + creation
    this.handleBillingAddressCreation(
      this.parsePayPalAddress(
        payer.name.given_name,
        payer.name.surname,
        payerEmail,
        payerPhoneNumber,
        payer.address
      )
    )
    // handle parsing + setting of shipping address in state + creation
    this.handleShippingAddressCreation(
      this.parsePayPalAddress(
        shippingFullName.slice(0, -1).join(' '),
        shippingFullName.slice(-1).join(' '),
        payerEmail,
        payerPhoneNumber,
        shippingDetails.address
      )
    ).then(() => {
      // set loading to false
      this.setState({ loading: false })
      // redirect to shipping method checkout step
      this.transitionToShippingMethodSection()
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
      completed: true,
      showEditButton: false
    }
  }

  /**
   * Handles the creation of new billing addresses
   * @param  {object} newBillingAddress
   */
  handleBillingAddressCreation (newBillingAddress) {
    const { dispatch, checkout } = this.props
    // set new address in state
    dispatch(setCheckoutBillingAddress(newBillingAddress))
    // create shipping address
    return dispatch(createBillingAddress(newBillingAddress)).then(() => {
      // set the created shipping address ID in state
      return dispatch(setCartBillingAddress(checkout.billingAddress.id))
    })
  }

  /**
   * Handles the creation of new shipping addresses
   * @param  {object} newShippingAddress
   */
  handleShippingAddressCreation (newShippingAddress) {
    const { dispatch, checkout } = this.props
    // set new address in state
    dispatch(setCheckoutShippingAddress(newShippingAddress))
    // create shipping address
    return dispatch(createShippingAddress(newShippingAddress)).then(() => {
      // set the created shipping address ID in state
      return dispatch(setCartShippingAddress(checkout.shippingAddress.id))
    })
  }

  /**
   * Handles the setting of PayPal order details in checkout state
   * @param  {object} payPalOrder
   */
  handlePayPalOrderDetails (payPalOrder) {
    const { dispatch } = this.props
    // dispatch action to set PayPal order details
    return dispatch(setPayPalOrderDetails({
      orderID: payPalOrder.id,
      intent: payPalOrder.intent,
      status: payPalOrder.status,
      purchaseUnitsReferenceID: payPalOrder.purchase_units[0].reference_id,
      createdAt: payPalOrder.create_time
    }))
  }

  /**
   * Handles the transition to checkout 3 - shipping method
   */
  transitionToShippingMethodSection () {
    const { setCurrentStep } = this.props
    // redirect to shipping method checkout step
    Router.push('/checkout/shipping-method')
    // set state for shipping method
    setCurrentStep(3)
  }

  render () {
    return (
      <div>
        { this.state.loading ? <Loading /> : <PaymentMethods
          nextSection={this.nextSection}
          paypalCreateOrder={this.payPalCreateOrder}
          paypalOnApprove={this.payPalOnApprove}
          handleSetPaymentMethod={this.handleSetPaymentMethod}
        /> }
      </div>
    )
  }
}

export default PaymentMethodPage
