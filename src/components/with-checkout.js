// Libraries
import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'
import Router from 'next/router'

// Libs
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Config
import Config from '../lib/config'

// Components
import {
  CheckoutCart,
  CheckoutCartTotal,
  CheckoutSteps,
  CouponForm,
  MiniPlaceOrder,
  PaymentIcons
} from '@shiftcommerce/shift-react-components'

// Actions
import {
  readCart,
  updateLineItemQuantity,
  deleteLineItem,
  submitCoupon,
  setAPIError
} from '../actions/cart-actions'
// When with-checkout.js is extracted from the reference site submitCoupon and setAPIError can be
// removed from 'client/actions/cart-actions'. These actions are duplicated in shift-next

export function withCheckout (WrappedComponent) {
  class WithCheckout extends Component {
    constructor (props) {
      super(props)

      this.wrappedRef = createRef()

      this.state = {
        loading: true,
        continueButtonProps: {},
        currentStep: 1
      }

      this.Head = Config.get().Head
      this.setCurrentStep = this.setCurrentStep.bind(this)
      this.updateQuantity = this.updateQuantity.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.handleCouponSubmit = this.handleCouponSubmit.bind(this)
    }

    static async getInitialProps (args) {
      if (WrappedComponent.getInitialProps) {
        return WrappedComponent.getInitialProps(args)
      }
    }

    componentDidMount () {
      this.props.dispatch(readCart()).then(() => {
        if (!this.props.cart.line_items_count) {
          return Router.push('/cart')
        }
        this.setState({
          loading: false
        })
      })
    }

    componentDidUpdate () {
      if (this.wrappedRef.current) {
        if (JSON.stringify(this.state.continueButtonProps) !== JSON.stringify(this.wrappedRef.current.continueButtonProps())) {
          this.setState({
            continueButtonProps: this.wrappedRef.current.continueButtonProps()
          })
        }

        if (this.state.pageTitle !== this.wrappedRef.current.pageTitle()) {
          this.setState({
            pageTitle: this.wrappedRef.current.pageTitle()
          })
        }

        if (this.state.currentStep !== this.wrappedRef.current.currentStep()) {
          this.setState({
            currentStep: this.wrappedRef.current.currentStep()
          })
        }

        if (this.wrappedRef.current.stepActions && JSON.stringify(this.state.stepActions) !== JSON.stringify(this.wrappedRef.current.stepActions())) {
          this.setState({
            stepActions: this.wrappedRef.current.stepActions()
          })
        }
      }
    }

    setCurrentStep (step) {
      this.setState({
        currentStep: step
      })
    }

    handleCouponSubmit (values, { setSubmitting, setErrors }) {
      return submitCoupon(values.couponCode)
        .then(() => this.props.dispatch(readCart({ force: true })))
        .catch((error) => setAPIError(error, setErrors))
        .finally(() => setSubmitting(false))
    }

    updateQuantity (e) {
      this.props.dispatch(updateLineItemQuantity(e.target.dataset.id, parseInt(e.target.value, 10)))
    }

    deleteItem (e) {
      e.preventDefault()
      this.props.dispatch(deleteLineItem(e.target.dataset.id)).then(() => {
        if (!this.props.cart.line_items_count) Router.push('/cart')
      })
    }

    render () {
      const { cart, order } = this.props
      const { continueButtonProps, currentStep, loading, stepActions } = this.state

      if (loading || !cart.id) {
        return <div>Loading</div>
      }

      return (
        <>
          <this.Head>
            <title>{ suffixWithStoreName(`Checkout - ${this.state.pageTitle}`) }</title>
          </this.Head>
          <CheckoutSteps
            currentStep={currentStep}
            stepActions={stepActions}
          />
          { currentStep === 4 && <MiniPlaceOrder
            convertToOrder={this.wrappedRef.current.convertToOrder}
            total={cart.total}
            isValidOrder={this.wrappedRef.current.isValidOrder(cart, order)}
          /> }
          <div className='c-checkout'>
            <div className='o-grid-container'>
              <div className='o-col-1-13 o-col-1-8-l'>
                <WrappedComponent
                  ref={this.wrappedRef}
                  setCurrentStep={this.setCurrentStep}
                  {...this.props}
                />
              </div>
              <div className='o-col-1-13 o-col-8-13-l'>
                <div className='c-checkout__cart'>
                  <CheckoutCart
                    deleteItem={this.deleteItem}
                    lineItems={cart.line_items}
                    lineItemsCount={cart.line_items_count}
                    total={cart.total}
                    updateQuantity={this.updateQuantity}
                  />
                  <CouponForm
                    handleSubmit={this.handleCouponSubmit}
                  />
                  <CheckoutCartTotal
                    continueButtonProps={continueButtonProps}
                    discountSummaries={cart.discount_summaries}
                    paymentError={order.paymentError}
                    shippingDiscount={cart.shipping_total_discount}
                    shippingDiscountName={cart.shipping_discount_name}
                    shippingTotal={cart.shipping_method && cart.shipping_method.total}
                    subTotal={cart.sub_total}
                    total={cart.total}
                  />
                  <div className='c-checkout__payment'>
                    <PaymentIcons />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }
  }

  return WithCheckout
}

const connectedWithCheckout = (WrappedComponent) => {
  const mapStateToProps = ({ account: { loggedIn }, cart, checkout, order }) => {
    return { cart, checkout, loggedIn, order }
  }

  return connect(mapStateToProps)(withCheckout(WrappedComponent))
}

export default connectedWithCheckout
