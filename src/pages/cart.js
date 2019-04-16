// Libraries
import React, { Component, Fragment } from 'react'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import ApiClient from '../lib/api-client'

// Actions
import {
  readCart,
  setAPIError,
  submitCoupon,
  updateLineItemQuantity,
  deleteLineItem
} from '../actions/cart-actions'

// Components
import {
  Breadcrumb,
  CartNoData,
  CartTable,
  CartTableGrid,
  CartTableGridItem,
  CartTableHeader,
  CartTablePaymentIcons,
  CartTableSummary,
  CouponForm,
  LineItems,
  Loading
} from '@shiftcommerce/shift-react-components'

// Config
import Config from '../lib/config'

const fetchShippingMethodsRequest = () => {
  return {
    endpoint: '/getShippingMethods'
  }
}

class CartPage extends Component {
  constructor (props) {
    super(props)

    // from cart-summary
    this.state = {
      loading: !props.cart.shipping_method
    }

    this.Head = Config.get().Head
    this.fetchShippingMethods = this.fetchShippingMethods.bind(this)
    this.updateQuantity = this.updateQuantity.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.handleCouponSubmit = this.handleCouponSubmit.bind(this)
  }

  async componentDidMount () {
    if (this.state.loading) {
      const cheapestShipping = (await this.fetchShippingMethods()).sort((method1, method2) => method1.total - method2.total)[0]

      this.setState({
        cheapestShipping: cheapestShipping,
        loading: false
      })
    }
  }

  async fetchShippingMethods () {
    try {
      const request = fetchShippingMethodsRequest()
      const response = await new ApiClient().read(request.endpoint, request.query)
      return response.data.data
    } catch (error) {
      return { error }
    }
  }

  handleCouponSubmit (values, { setSubmitting, setErrors }) {
    return submitCoupon(values.couponCode)
      .then(() => this.props.dispatch(readCart({ force: true })))
      .catch((error) => setAPIError(error, setErrors))
      .finally(() => setSubmitting(false))
  }

  updateQuantity (event) {
    this.props.dispatch(updateLineItemQuantity(event.target.dataset.id, parseInt(event.target.value, 10)))
  }

  deleteItem (event) {
    event.preventDefault()
    this.props.dispatch(deleteLineItem(event.target.dataset.id))
  }

  /**
   * Render the no-data message, or the cart contents, based on if the cart has
   * contents or not
   * @param  {Object} cart
   * @return {string} - HTML markup for the component
   */
  renderCartTableGrid (cart) {
    if (!cart.line_items_count) {
      return (
        <CartNoData />
      )
    } else {
      return (
        <Fragment>
          <CartTableGridItem item='a'>
            <LineItems
              deleteItem={this.deleteItem}
              lineItems={cart.line_items}
              lineItemsCount={cart.line_items_count}
              updateQuantity={this.updateQuantity}
            />
          </CartTableGridItem>
          <CartTableGridItem item='b'>
            <CouponForm
              handleSubmit={this.handleCouponSubmit}
            />
            <CartTableSummary
              cart={cart}
              loading={this.state.loading}
              cheapestShipping={this.state.cheapestShipping}
              aria-label='Cart Summary'
            />
            <CartTablePaymentIcons />
          </CartTableGridItem>
        </Fragment>
      )
    }
  }

  /**
   * Render the cart page when loaded. This method is seperate to the main
   * render method so it can be overridden, without overriding the loading and
   * error parts of the render method
   * @return {String} - HTML markup for the component
   */
  renderLoaded () {
    const { cart } = this.props
    const { cheapestShipping } = this.state

    return (
      <CartTable>
        <CartTableHeader
          cart={cart}
          shippingMethod={cart.shipping_method || cheapestShipping}
          breadcrumb={<Breadcrumb />}
        />
        <CartTableGrid>
          { this.renderCartTableGrid(cart) }
        </CartTableGrid>
      </CartTable>
    )
  }

  render () {
    const { loading } = this.state

    if (loading) {
      return (
        <Loading />
      )
    } else {
      return (
        <Fragment>
          <this.Head>
            <title>{ suffixWithStoreName('Your Shopping Cart') }</title>
          </this.Head>
          { this.renderLoaded() }
        </Fragment>
      )
    }
  }
}

export default CartPage
