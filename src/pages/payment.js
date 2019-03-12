// Libraries
import React, { Component } from 'react'
import Router from 'next/router'
import classNames from 'classnames'
import Cookies from 'js-cookie'

// Libs
import addressFormValidator from '../lib/address-form-validator'
import InputFieldValidator from '../lib/input-field-validator'

// Components
import {
  AddressFormSummary,
  Loading,
  PaymentMethod,
  PaymentMethodSummary,
  ShippingMethodsSummary
} from 'shift-react-components'

// Actions
import {
  autoFillBillingAddress,
  inputChange,
  inputComplete,
  setValidationMessage,
  showField
} from '../actions/checkout-actions'
import { setCartBillingAddress, createBillingAddress } from '../actions/cart-actions'
import {
  requestCardToken,
  setCardToken,
  setPaymentError,
  setCardErrors
} from '../actions/order-actions'
import { deleteAddressBookEntry, fetchAddressBook, saveToAddressBook } from '../actions/address-book-actions'

// Json
import countries from '../static/countries.json'

class CheckoutPaymentPage extends Component {
  constructor () {
    super()

    this.state = {
      loading: true,
      reviewStep: false
    }

    this.nextSection = this.nextSection.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onInputBlur = this.onInputBlur.bind(this)
    this.onShowField = this.onShowField.bind(this)

    this.autoFillAddress = this.autoFillAddress.bind(this)
    this.changeBillingAsShipping = this.changeBillingAsShipping.bind(this)
    this.onCardTokenReceived = this.onCardTokenReceived.bind(this)
    this.setCardErrors = this.setCardErrors.bind(this)
    this.onAddressDeleted = this.onAddressDeleted.bind(this)
    this.onNewAddress = this.onNewAddress.bind(this)
    this.onBookAddressSelected = this.onBookAddressSelected.bind(this)
    this.addressFormDisplayed = this.addressFormDisplayed.bind(this)
    this.nextStepAvailable = this.nextStepAvailable.bind(this)
    this.showPayment = this.showPayment.bind(this)
    this.convertToOrder = this.convertToOrder.bind(this)
    this.continueButtonProps = this.continueButtonProps.bind(this)
  }

  componentDidMount () {
    if (!this.props.cart.shipping_address) {
      return Router.push('/checkout/shipping-address')
    }
    if (!this.props.cart.shipping_method) {
      return Router.push('/checkout/shipping-method')
    }

    return (this.loggedIn() ? this.props.dispatch(fetchAddressBook()) : Promise.resolve()).then(() => {
      if (!this.props.cart.billing_address) {
        return this.onBookAddressSelected(this.props.cart.shipping_address.id).then(() => {
          this.setState({
            billingAsShipping: true
          })
        })
      } else if (this.props.cart.shipping_address.id === this.props.cart.billing_address.id) {
        this.setState({
          billingAsShipping: true
        })
      }
    }).then(() => {
      this.setState({
        loading: false
      })
    })
  }

  // The following two methods enable navigating back and forth using the browser's
  // back and forward buttons
  static async getInitialProps ({ req }) {
    if (!req) {
      return {
        propsPath: Router.asPath
      }
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (state.reviewStep && Router.asPath === '/checkout/payment' && props.propsPath === '/checkout/review') {
      return {
        reviewStep: false
      }
    } else if (!state.reviewStep && Router.asPath === '/checkout/review' && props.propsPath === '/checkout/payment') {
      return {
        reviewStep: true
      }
    }
    return null
  }

  loggedIn () {
    return Cookies.get('signedIn')
  }

  autoFillAddress (address) {
    this.props.dispatch(autoFillBillingAddress(address))
  }

  showReview () {
    const { setCurrentStep } = this.props
    Router.push('/checkout/payment', '/checkout/review')
    this.setState({
      reviewStep: true
    })
    setCurrentStep(4)
  }

  showPayment () {
    const { setCurrentStep } = this.props
    Router.push('/checkout/payment', '/checkout/payment')
    this.setState({
      reviewStep: false
    })
    setCurrentStep(3)
  }

  validateInput (formName, fieldName, fieldValue, rules) {
    let validationMessage = new InputFieldValidator(fieldName, fieldValue, rules).validate()
    this.props.dispatch(setValidationMessage(formName, fieldName, validationMessage))
  }

  onInputChange (event, formName, fieldName, fieldValue) {
    this.props.dispatch(inputChange(formName, fieldName, fieldValue))
  }

  onInputBlur (event, formName, fieldName, fieldValue, rules) {
    this.validateInput(formName, fieldName, fieldValue, rules)
    this.props.dispatch(inputComplete())
  }

  onShowField (formName, fieldName) {
    this.props.dispatch(showField(formName, fieldName))
  }

  // Address to prepopulate the form with
  // We only want to do so if the address is not in the address book
  addressForForm () {
    if (!this.state.addingNewAddress && !this.cartAddressFromBook()) return this.props.cart.billing_address
  }

  changeBillingAsShipping (event) {
    const { cart: { shipping_address }, checkout: { addressBook } } = this.props

    if (event.target.checked) {
      return this.onBookAddressSelected(shipping_address.id).then(() => {
        this.setState({
          billingAsShipping: true
        })
      })
    } else if (!this.addressBookEmpty()) {
      const preferredAddress = addressBook.find(address => address.preferred_billing)
      return this.props.dispatch(setCartBillingAddress((preferredAddress && preferredAddress.id) || addressBook[0].id)).then(() => {
        this.setState({
          billingAsShipping: false
        })
      })
    } else {
      this.onNewAddress()
    }
  }

  onCardTokenReceived ({ error, token }) {
    const { dispatch } = this.props

    if (error) {
      return dispatch(setPaymentError(error.message)).then(() => {
        return dispatch(requestCardToken(false))
      })
    } else {
      return dispatch(setCardToken(token, 'card')).then(() => {
        dispatch(requestCardToken(false))
        Router.push('/order')
      })
    }
  }

  setCardErrors (error) {
    this.props.dispatch(setCardErrors(error))
  }

  addressBookEmpty () {
    return !this.props.checkout.addressBook.length
  }

  onNewAddress () {
    this.setState({
      addingNewAddress: true,
      billingAsShipping: false
    })
  }

  onBookAddressSelected (id) {
    return this.props.dispatch(setCartBillingAddress(id)).then(() => {
      this.setState({
        addingNewAddress: false
      })
    })
  }

  onAddressDeleted (address) {
    this.props.dispatch(deleteAddressBookEntry(address))
  }

  addressFormDisplayed () {
    return this.addressBookEmpty() || this.state.addingNewAddress || !this.cartAddressFromBook()
  }

  cartAddressFromBook () {
    const { cart: { billing_address }, checkout: { addressBook } } = this.props

    if (!this.loggedIn() || !billing_address) return false

    return addressBook.map(address => parseInt(address.id)).includes(parseInt(billing_address.id))
  }

  nextStepAvailable () {
    const { cart, checkout: { billingAddress }, order } = this.props
    return !order.card_errors && (((this.cartAddressFromBook() || cart.shipping_address.id === (cart.billing_address && cart.billing_address.id)) && !this.state.addingNewAddress) || addressFormValidator(billingAddress))
  }

  nextSection (eventType) {
    const { dispatch, checkout } = this.props

    if (this.state.addingNewAddress || (!this.cartAddressFromBook() && this.props.cart.billing_address.id !== this.props.cart.shipping_address.id)) {
      if (checkout.billingAddress.saveToAddressBook) {
        dispatch(saveToAddressBook(checkout.billingAddress)).then(() => {
          dispatch(setCartBillingAddress(checkout.billingAddress.id))
        })
      } else {
        dispatch(createBillingAddress(checkout.billingAddress)).then(() => {
          dispatch(setCartBillingAddress(checkout.billingAddress.id))
        })
      }
    }

    this.showReview()
  }

  isValidOrder (cart, order) {
    const shippingAddressPresent = !!(cart.shipping_address || {}).id
    const shippingMethodPresent = !!(cart.shipping_method || {}).id
    const billingAddressPresent = !!(cart.billing_address || {}).id
    return !order.card_errors && shippingAddressPresent && shippingMethodPresent && billingAddressPresent
  }

  convertToOrder () {
    this.props.dispatch(requestCardToken(true))
  }

  continueButtonProps () {
    const { cart, order } = this.props

    if (this.state.reviewStep) {
      return {
        'aria-label': 'Place Order',
        label: 'Place Order',
        status: this.isValidOrder(cart, order) ? 'primary' : 'disabled',
        disabled: !this.isValidOrder(cart, order),
        onClick: this.convertToOrder
      }
    } else {
      return {
        'aria-label': 'Review Order',
        label: 'Review Your Order',
        status: 'primary',
        disabled: !this.nextStepAvailable(),
        onClick: () => { this.nextSection('complete') }
      }
    }
  }

  pageTitle = () => `Checkout - ${this.state.reviewStep ? 'Review' : 'Payment'}`

  currentStep = () => this.state.reviewStep ? 4 : 3

  stepActions = () => ({
    3: () => {
      this.setState({ reviewStep: false })
      this.props.setCurrentStep(3)
    }
  })

  renderPayment () {
    const { cart, checkout: { addressBook }, loggedIn, order } = this.props

    return (
      <>
        <div className={classNames({ 'u-hidden': !this.state.reviewStep })}>
          <PaymentMethodSummary
            billingAddress={cart.billing_address}
            onClick={this.showPayment}
            withErrors={!!order.paymentError}
          />
        </div>
        <div className={classNames({ 'u-hidden': this.state.reviewStep })}>
          <PaymentMethod
            addingNewAddress={this.state.addingNewAddress}
            addressBook={addressBook}
            addressFormDisplayed={this.addressFormDisplayed}
            autoFillAddress={this.autoFillAddress}
            billingAsShipping={this.state.billingAsShipping}
            cart={this.props.cart}
            changeBillingAsShipping={this.changeBillingAsShipping}
            countries={countries}
            currentAddress={this.addressForForm()}
            formName='paymentMethod'
            loggedIn={loggedIn}
            nextStepAvailable={this.nextStepAvailable}
            nextSection={this.nextSection}
            onAddressDeleted={this.onAddressDeleted}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
            onCardTokenReceived={this.onCardTokenReceived}
            onNewAddress={this.onNewAddress}
            onBookAddressSelected={this.onBookAddressSelected}
            setCardErrors={this.setCardErrors}
            {...this.props}
          />
        </div>
      </>
    )
  }

  render () {
    const { cart, cart: { shipping_address } } = this.props

    if (this.state.loading) {
      return <Loading />
    }

    return (
      <>
        <div className='c-checkout__addressform'>
          <div className='o-form__address'>
            <AddressFormSummary
              addressLine1={shipping_address.address_line_1}
              city={shipping_address.city}
              firstName={shipping_address.first_name}
              lastName={shipping_address.last_name}
              onClick={() => Router.push('/checkout/shipping-address')}
              postcode={shipping_address.postcode}
            />
          </div>
        </div>
        <ShippingMethodsSummary
          onClick={() => Router.push('/checkout/shipping-method')}
          shippingMethod={cart.shipping_method}
        />
        { this.renderPayment() }
      </>
    )
  }
}

export default CheckoutPaymentPage
