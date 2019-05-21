// Libraries
import React, { Component } from 'react'
import Router from 'next/router'
import Cookies from 'js-cookie'

// Libs
import addressFormValidator from '../lib/address-form-validator'
import InputFieldValidator from '../lib/input-field-validator'

import {
  AddressBook,
  AddressFormHeader,
  Button,
  CheckoutAddressForm,
  PaymentMethodSummary
} from '@shiftcommerce/shift-react-components'

// Actions
import {
  autoFillAddress,
  inputChange,
  setValidationMessage,
  showField } from '../actions/checkout-actions'
import { setCartShippingAddress, createShippingAddress } from '../actions/cart-actions'
import { deleteAddressBookEntry, fetchAddressBook, saveToAddressBook } from '../actions/address-book-actions'

// Json
import countries from '../static/countries.json'

export class ShippingAddressPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      paymentMethod: Cookies.get('paymentMethod')
    }

    this.autoFillAddress = this.autoFillAddress.bind(this)
    this.onAddressDeleted = this.onAddressDeleted.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onInputBlur = this.onInputBlur.bind(this)
    this.onShowField = this.onShowField.bind(this)
    this.onBookAddressSelected = this.onBookAddressSelected.bind(this)
    this.onNewAddress = this.onNewAddress.bind(this)
  }

  componentDidMount () {
    const { cart, thirdPartyPaymentMethods } = this.props

    if (cart.shipping_address && (thirdPartyPaymentMethods.includes(this.state.paymentMethod))) {
      // If shipping address is present and customer has used third party payment service
      // redirect to the payment method page
      return Router.push('/checkout/payment-method')
    }

    if (this.loggedIn()) {
      return this.props.dispatch(fetchAddressBook()).then(() => {
        if (!this.props.cart.shipping_address && !this.addressBookEmpty()) {
          const preferredAddress = this.props.checkout.addressBook.find(address => address.preferred_shipping)
          return this.props.dispatch(setCartShippingAddress((preferredAddress || {}).id || this.props.checkout.addressBook[0].id))
        }
      }).then(() => {
        this.setState({
          loading: false
        })
      })
    } else {
      this.setState({
        loading: false
      })
    }
  }

  loggedIn () {
    return Cookies.get('signedIn')
  }

  autoFillAddress (address) {
    this.props.dispatch(autoFillAddress(address))
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
  }

  onShowField (formName, fieldName) {
    this.props.dispatch(showField(formName, fieldName))
  }

  nextSection () {
    const { dispatch, checkout } = this.props

    if (this.state.addingNewAddress || !this.cartAddressFromBook()) {
      if (checkout.shippingAddress.saveToAddressBook) {
        return dispatch(saveToAddressBook(checkout.shippingAddress)).then(() => {
          return dispatch(setCartShippingAddress(checkout.shippingAddress.id)).then(() => {
            Router.push('/checkout/shipping-method')
          })
        })
      } else {
        return dispatch(createShippingAddress(checkout.shippingAddress)).then(() => {
          return dispatch(setCartShippingAddress(checkout.shippingAddress.id)).then(() => {
            Router.push('/checkout/shipping-method')
          })
        })
      }
    } else {
      Router.push('/checkout/shipping-method')
    }
  }

  addressFormDisplayed () {
    // Only render the form if
    // * there is nothing in the address book
    // * OR there is something in the address book but someone clicked new address
    // * OR the address exists on cart but it does not belong to the address book
    return this.addressBookEmpty() || this.state.addingNewAddress || !this.cartAddressFromBook()
  }

  addressBookEmpty () {
    return !this.props.checkout.addressBook.length
  }

  cartAddressFromBook () {
    const { cart, checkout: { addressBook } } = this.props

    if (!this.loggedIn() || !cart.shipping_address) return false

    return addressBook.map(address => parseInt(address.id)).includes(parseInt(cart.shipping_address.id))
  }

  onBookAddressSelected (id) {
    this.props.dispatch(setCartShippingAddress(id)).then(() => {
      this.setState({
        addingNewAddress: false
      })
    })
  }

  onAddressDeleted (address) {
    this.props.dispatch(deleteAddressBookEntry(address))
  }

  onNewAddress () {
    this.setState({
      addingNewAddress: true
    })
  }

  // Address to prepopulate the form with
  // We only want to do so if the address is not in the address book
  addressForForm () {
    if (!this.state.addingNewAddress && !this.cartAddressFromBook()) return this.props.cart.shipping_address
  }

  renderFormSubmitButton () {
    return (
      <div className='o-form__input-group'>
        <Button
          aria-label='View Shipping Options'
          className='c-address-form__button o-button--sml'
          label='View Shipping Options'
          status={(this.nextStepAvailable() ? 'positive' : 'disabled')}
          type='primary'
          disabled={!this.nextStepAvailable()}
          onClick={() => this.nextSection()}
        />
      </div>
    )
  }

  nextStepAvailable () {
    const { checkout: { shippingAddress } } = this.props
    return (this.cartAddressFromBook() && !this.state.addingNewAddress) || addressFormValidator(shippingAddress)
  }

  pageTitle = () => 'Shipping Address'

  currentStep = () => 2

  continueButtonProps () {
    return {
      'aria-label': 'Choose Shipping Method',
      label: 'Choose Shipping Method',
      status: 'positive',
      disabled: !this.nextStepAvailable(),
      onClick: () => { this.nextSection() }
    }
  }

  render () {
    const { checkout: { addressBook } } = this.props
    const hasLineItems = this.props.cart.line_items_count > 0

    // Don't render anything server-side or when loading data
    if (!hasLineItems || this.state.loading) return <div></div>

    return (
      <>
        <PaymentMethodSummary
          onClick={() => Router.push('/checkout/payment-method')}
          paymentMethod={this.state.paymentMethod}
          headerTitle={'Payment Method'}
          showEditButton={true}
        />
        <div className='c-checkout__addressform'>
          <div className='o-form__address'>
            <AddressFormHeader title='Shipping Address' />
            { !this.addressBookEmpty() && <AddressBook
              addressBook={addressBook}
              formName='shippingAddress'
              currentAddressId={this.props.cart.shipping_address && this.props.cart.shipping_address.id}
              onAddressDeleted={this.onAddressDeleted}
              onNewAddress={this.onNewAddress}
              onBookAddressSelected={this.onBookAddressSelected}
              addressFormDisplayed={this.addressFormDisplayed()}
            /> }
            { this.addressFormDisplayed() && <CheckoutAddressForm
              autoFillAddress={this.autoFillAddress}
              checkout={this.props.checkout}
              countries={countries}
              currentAddress={this.addressForForm()}
              formName='shippingAddress'
              loggedIn={this.props.loggedIn}
              onChange={this.onInputChange}
              onBlur={this.onInputBlur}
              onShowField={this.onShowField}
            /> }
            { this.renderFormSubmitButton() }
          </div>
        </div>
      </>
    )
  }
}

export default ShippingAddressPage
