// Libraries
import React, { Component } from 'react'
import Router from 'next/router'
import Cookies from 'js-cookie'

// Actions
import { 
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
import { PaymentMethods, Loading } from '@shiftcommerce/shift-react-components'

export class PaymentMethodPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }

    this.nextSection = this.nextSection.bind(this)
    this.payPalCreateOrder = this.payPalCreateOrder.bind(this)
    this.payPalOnApprove = this.payPalOnApprove.bind(this)
    this.handleSetPaymentMethod = this.handleSetPaymentMethod.bind(this)
  }

  componentDidMount () {
    // TODO: - interim solution for delaying PaymentMethods component rendering
    // in order for PayPal SDK to load 
    // Remove timeout once SSR has been fixed
    setTimeout(() => this.setState({
      loading: false
    }), 1000)
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
    Cookies.set('paymentMethod', paymentMethod)
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
    const { payer } = order
    const payerEmail = payer.email_address
    const payerPhone = payer.phone
    const payerPhoneNumber = (payerPhone && payerPhone.phone_number ? payerPhone.phone_number.national_number : '')
    const shippingDetails = order.purchase_units[0].shipping
    const shippingFullName = shippingDetails.name.full_name.split(' ')
    // set loading to true as we handle the order information
    this.setState({ loading: true })
    // handle basic order details - PayPal order ID + purchase units reference id
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
    ).then(() => {
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
        // set the created billing and shipping address IDs on the Cart
        this.updateCartAddresses().then(() => {
          // redirect to shipping method checkout step
          this.transitionToShippingMethodSection()
        })
      })
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
    const { dispatch } = this.props
    // set new address in state
    dispatch(setCheckoutBillingAddress(newBillingAddress))
    // create shipping address
    return dispatch(createBillingAddress(newBillingAddress))
  }

  /**
   * Handles the creation of new shipping addresses
   * @param  {object} newShippingAddress
   */
  handleShippingAddressCreation (newShippingAddress) {
    const { dispatch } = this.props
    // set new address in state
    dispatch(setCheckoutShippingAddress(newShippingAddress))
    // create shipping address
    return dispatch(createShippingAddress(newShippingAddress))
  }

  /**
   * Handles the updating of cart billing and shipping addresses
   */
  updateCartAddresses () {
    const { dispatch, checkout } = this.props
    // set the created shipping address ID on the Cart
    return dispatch(setCartBillingAddress(checkout.billingAddress.id)).then(() => {
      // set the created shipping address ID on the Cart
      return dispatch(setCartShippingAddress(checkout.shippingAddress.id))
    })
  }

  /**
   * Handles the setting of PayPal order details in checkout state
   * @param  {object} payPalOrder
   */
  handlePayPalOrderDetails (payPalOrder) {
    // set PayPal order ID in a cookie
    Cookies.set('ppOrderID', payPalOrder.id)
    // set purchaseUnitsReferenceID in a cookie
    Cookies.set('purchaseUnitsReferenceID', payPalOrder.purchase_units[0].reference_id)
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
      <>
        { this.state.loading ? <Loading /> : <PaymentMethods
          nextSection={this.nextSection}
          paypalCreateOrder={this.payPalCreateOrder}
          paypalOnApprove={this.payPalOnApprove}
          handleSetPaymentMethod={this.handleSetPaymentMethod}
        /> }
      </>
    )
  }
}

export default PaymentMethodPage
