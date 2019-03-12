//  Libraries
import React, { Component } from 'react'
import Link from 'next/link'
import t from 'typy'

// Objects
import { Button, Image, OrderSummary } from '@shiftcommerce/shift-react-components'

class OrderPage extends Component {
  renderHeader (order) {
    const customerName = t(order, 'shipping_address.attributes.first_name').safeObject

    return (
      <div className='c-order__header'>
        <div className='c-order__header-tick'>✔</div>
        <div className='c-order__header-text'>
          <p className='c-order__header-text-id u-text-color--orange u-bold'>Order #{ order.id }</p>
          <h3 className='u-bold'>Thank you { customerName }!</h3>
        </div>
      </div>
    )
  }

  renderOrderConfirmationMessage (order) {
    return (
      <div className='c-order__detail-confirmation-message'>
        <h2>Your order is confirmed</h2>
        <p>We've accepted your order and we're getting it ready. A confirmation email has been sent to <span className='u-text-color--orange'>{ order.email }</span>. Come back to this page for updates on your order status.</p>
      </div>
    )
  }

  renderShippingAddress (order) {
    const shippingAddress = t(order, 'shipping_address.attributes').safeObject

    return (
      <div className='c-order__detail-shipping-address'>
        <h2>Shipping Address</h2>
        <p>{ shippingAddress.first_name } { shippingAddress.last_name }</p>
        <p>{ shippingAddress.address_line_1 }, { shippingAddress.address_line_2 }, { shippingAddress.postcode }</p>
      </div>
    )
  }

  renderShippingMethod (order) {
    const shippingMethod = t(order, 'shipping_method.attributes').safeObject

    return (
      <div className='c-order__detail-shipping-method'>
        <h2>Shipping Method</h2>
        <p>{ shippingMethod.label }</p>
        <p>Estimated Delivery:<span> { shippingMethod.description }</span></p>
      </div>
    )
  }

  renderCardImage (cardDetails) {
    if (cardDetails.brand === 'Visa') {
      return (
        <Image src='/static/payments/visa.svg' className='c-order__detail-payment-method-card-image' />
      )
    }
  }

  renderPaymentMethod (order) {
    const billingAddress = t(order, 'billing_address.attributes').safeObject
    const cardDetails = t(order, 'cardToken.card').safeObject
    const displayMonth = { 1: '01', 2: '02', 3: '02', 4: '04', 5: '05', 6: '06', 7: '07', 8: '08', 9: '09', 10: '10', 11: '11', 12: '12' }

    return (
      <div className='c-order__detail-payment-method'>
        <h2>Payment Method</h2>
        <div className='c-order__detail-payment-method-card'>
          { this.renderCardImage(cardDetails) }
          <div className='c-order__detail-payment-method-card-details'>
            <span className='u-bold'>**** **** **** { cardDetails.last4 }</span>
            <span className='u-bold'>Exp: { displayMonth[cardDetails.exp_month] }/{ cardDetails.exp_year }</span>
          </div>
        </div>
        <p className='u-bold'>Billing Address:</p>
        <p>{ billingAddress.first_name } { billingAddress.last_name }</p>
        <p>{ billingAddress.address_line_1 }, { billingAddress.address_line_2 }, { billingAddress.postcode }</p>
      </div>
    )
  }

  renderContinueShoppingButton () {
    return (
      <div className='c-order__button'>
        <Link href='/'>
          <Button
            aria-label='Continue Shopping'
            label='Continue shopping'
            status='positive'
            className='c-order__button--continue o-button--sml'
            type='button'
          />
        </Link>
      </div>
    )
  }

  renderOrderDetails (order) {
    return (
      <div className='c-order__detail'>
        { this.renderOrderConfirmationMessage(order) }
        { this.renderShippingAddress(order) }
        { this.renderShippingMethod(order) }
        { this.renderPaymentMethod(order) }
      </div>
    )
  }

  render () {
    const { order } = this.props

    if (order.loading) {
      return (
        <p>Loading...</p>
      )
    } else if (order.error) {
      return (
        <p>{ order.error }</p>
      )
    } else {
      return (
        <div className='c-order'>
          { this.renderHeader(order) }
          <div className='c-order__body'>
            <div className='c-order__body-panel-left'>
              { this.renderOrderDetails(order) }
            </div>
            <div className='c-order__body-panel-right'>
              <OrderSummary order={order} />
              { this.renderContinueShoppingButton() }
            </div>
          </div>
        </div>
      )
    }
  }
}

export default OrderPage
