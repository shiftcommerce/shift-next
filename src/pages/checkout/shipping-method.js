// Libraries
import React, { Component } from 'react'
import Router from 'next/router'

// Libs
import ApiClient from '../../lib/api-client'

// Actions
import {
  fetchShippingMethodsRequest,
  setCartShippingMethod
} from '../../actions/cart-actions'

// Components
import {
  AddressFormSummary,
  ShippingMethods
} from '@shiftcommerce/shift-react-components'

export class ShippingMethodPage extends Component {
  static async fetchShippingMethods () {
    try {
      const request = fetchShippingMethodsRequest()
      const response = await new ApiClient().read(request.endpoint, request.query)

      return response.data
    } catch (error) {
      return { error }
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      loading: true
    }

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleSetShippingMethod = this.handleSetShippingMethod.bind(this)
    this.nextSection = this.nextSection.bind(this)
  }

  async componentDidMount () {
    if (!this.props.cart.shipping_address) {
      return Router.push('/checkout/shipping-address')
    }

    const shippingMethods = (await this.constructor.fetchShippingMethods()).data.sort((method1, method2) => method1.total - method2.total)

    if (!this.props.cart.shipping_method) {
      this.props.dispatch(setCartShippingMethod(shippingMethods[0].id))
    }

    this.setState({
      shippingMethods: shippingMethods,
      loading: false
    })
  }

  /**
   * When the form is submitted, move onto the next section
   * @param  {object} event
   */
  handleFormSubmit (event) {
    event.preventDefault()
    this.nextSection('complete')
  }

  /**
   * When a shipping method is selected, dispatch that to the api, and add the
   * current shipping method to the state
   * @param  {object} shippingMethod
   */
  handleSetShippingMethod (shippingMethod) {
    this.props.dispatch(setCartShippingMethod(shippingMethod.id))
    this.setState({ selectedShippingMethod: shippingMethod })
  }

  nextSection (eventType) {
    Router.push('/checkout/payment')
  }

  continueButtonProps () {
    return {
      'aria-label': 'Continue to Payment',
      label: 'Continue to Payment',
      status: 'positive',
      onClick: () => { this.nextSection('complete') }
    }
  }

  pageTitle = () => 'Shipping Method'

  currentStep = () => 2

  render () {
    const { cart } = this.props

    if (!cart.shipping_address) return null

    return (
      <div>
        <div className='c-checkout__addressform'>
          <div className='o-form__address'>
            <AddressFormSummary
              addressLine1={cart.shipping_address.address_line_1}
              city={cart.shipping_address.city}
              firstName={cart.shipping_address.first_name}
              lastName={cart.shipping_address.last_name}
              onClick={() => Router.push('/checkout/shipping-address')}
              postcode={cart.shipping_address.postcode}
            />
          </div>
        </div>
        { this.state.loading ? <p>Loading...</p> : <ShippingMethods
          cartLineItemsCount={cart.line_items_count}
          cartShippingMethod={cart.shipping_method}
          handleFormSubmit={this.handleFormSubmit}
          handleSetShippingMethod={this.handleSetShippingMethod}
          shippingMethods={this.state.shippingMethods}
        /> }
      </div>
    )
  }
}

export default ShippingMethodPage
