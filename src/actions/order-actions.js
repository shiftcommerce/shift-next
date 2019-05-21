// Lib
import { decimalPrice } from '../lib/decimal-price'

// actionTypes
import * as types from './action-types'

// Actions
import { readEndpoint, postEndpoint } from './api-actions'

export function createOrder (cart, paymentMethod, order) {
  const request = {
    endpoint: '/createOrder',
    body: convertCheckoutToOrder(cart, paymentMethod, order),
    requestActionType: types.CREATE_ORDER,
    successActionType: types.SET_ORDER,
    errorActionType: types.ERROR_ORDER
  }
  return postEndpoint(request)
}

export function requestCardToken (boolean) {
  return {
    type: types.REQUEST_CARD_TOKEN,
    value: boolean
  }
}

export function setCardToken (token, paymentMethod) {
  return (dispatch, getState) => {
    dispatch({
      type: types.SET_CARD_TOKEN,
      value: token
    })
    return dispatch(createOrder(getState().cart, paymentMethod, getState().order))
  }
}

export function setPaymentError (message) {
  return {
    type: types.SET_PAYMENT_ERROR,
    value: message
  }
}

export function setCardErrors (boolean) {
  return {
    type: types.CARD_ERRORS,
    errors: boolean
  }
}

export function getCustomerOrders () {
  return readEndpoint({
    endpoint: `/customerOrders`,
    requestActionType: types.GET_CUSTOMER_ORDERS,
    successActionType: types.SET_CUSTOMER_ORDERS
  })
}

export function convertCheckoutToOrder (cart, paymentMethod, order) {
  const lineItems = prepareLineItems(cart)
  const discountSummaries = prepareDiscountSummaries(cart, lineItems)
  const orderDiscountIncTax = cart.shipping_total_discount * -1
  const orderDiscountExcTax = orderDiscountIncTax > 0 ? cart.shipping_method.sub_total : 0
  const shippingTotalExTax = cart.free_shipping ? 0 : cart.shipping_method.sub_total

  const orderPayload = {
    attributes: {
      billing_address: prepareBillingAddress(cart.billing_address),
      channel: 'web',
      currency: 'GBP',
      email: cart.shipping_address.meta_attributes.email.value,
      line_items_resources: prepareLineItems(cart),
      shipping_address: prepareShippingAddress(cart.shipping_address),
      shipping_method: prepareShippingMethod(cart.shipping_method),
      discount_summaries: discountSummaries,
      total_inc_tax: cart.total,
      total_ex_tax: lineItems.reduce((sum, lineItem) => sum + lineItem.attributes.line_total_ex_tax, 0) + shippingTotalExTax,
      pre_discount_line_items_total_ex_tax: lineItems.reduce((sum, lineItem) => sum + lineItem.attributes.pre_discount_line_total_ex_tax, 0),
      pre_discount_line_items_total_inc_tax: lineItems.reduce((sum, lineItem) => sum + lineItem.attributes.pre_discount_line_total_inc_tax, 0),
      order_discount_ex_tax: orderDiscountExcTax,
      order_discount_inc_tax: orderDiscountIncTax,
      total_discount_ex_tax: discountSummaries.reduce((sum, discount) => sum + discount.attributes.amount_ex_tax, 0) + orderDiscountExcTax,
      total_discount_inc_tax: discountSummaries.reduce((sum, discount) => sum + discount.attributes.amount_inc_tax, 0) + orderDiscountIncTax,
      shipping_total: cart.shipping_total + cart.shipping_total_discount,
      placed_at: new Date().toISOString(),
      free_shipping: cart.free_shipping,
      settle_payments_immediately: true,
      shipping_discount_name: cart.shipping_discount_name,
      shipping_discount: cart.shipping_total_discount
    },
    type: 'create_order'
  }

  return {
    data: roundDecimals(orderPayload),
    payment_method: paymentMethod,
    card_token: order.cardToken,
    payment_authorization_id: order.paymentAuthorization.id
  }
}

function prepareLineItems (cart) {
  return cart.line_items.map((lineItem) => {
    const eachExTax = lineItem.item.price_includes_taxes ? lineItem.unit_price / (1 + parseFloat(lineItem.tax_rate)) : lineItem.unit_price
    const eachIncTax = lineItem.item.price_includes_taxes ? lineItem.unit_price : (1 + parseFloat(lineItem.tax_rate)) * lineItem.unit_price
    const preDiscountLineTotalExTax = eachExTax * lineItem.unit_quantity
    const preDiscountLineTotalIncTax = eachIncTax * lineItem.unit_quantity
    const lineDiscountExTax = lineItem.item.price_includes_taxes ? lineItem.total_discount / (1 + parseFloat(lineItem.tax_rate)) : lineItem.total_discount
    const lineDiscountIncTax = lineItem.item.price_includes_taxes ? lineItem.total_discount : (1 + parseFloat(lineItem.tax_rate)) * lineItem.total_discount

    return {
      attributes: {
        sku: lineItem.sku,
        title: lineItem.title,
        unit_quantity: lineItem.unit_quantity,
        each_ex_tax: eachExTax,
        each_inc_tax: eachIncTax,
        pre_discount_line_total_ex_tax: preDiscountLineTotalExTax,
        pre_discount_line_total_inc_tax: preDiscountLineTotalIncTax,
        line_discount_ex_tax: lineDiscountExTax,
        line_discount_inc_tax: lineDiscountIncTax,
        line_total_ex_tax: preDiscountLineTotalExTax - lineDiscountExTax,
        line_total_inc_tax: preDiscountLineTotalIncTax - lineDiscountIncTax,
        tax_rate: lineItem.tax_rate,
        line_item_discounts: lineItem.line_item_discounts.map(discount => {
          const amountExTax = lineItem.item.price_includes_taxes ? discount.total / (1 + parseFloat(lineItem.tax_rate)) : discount.total
          const amountIncTax = lineItem.item.price_includes_taxes ? discount.total : (1 + parseFloat(lineItem.tax_rate)) * discount.total

          return {
            id: discount.id,
            type: 'line_item_discounts',
            attributes: {
              line_item_number: discount.line_item_number,
              promotion_id: discount.promotion_id,
              amount_ex_tax: amountExTax,
              amount_inc_tax: amountIncTax,
              label: cart.discount_summaries.find(discountSummary => discountSummary.promotion_id === discount.promotion_id).name
            }
          }
        })
      },
      type: 'line_items'
    }
  })
}

function prepareBillingAddress (address) {
  return prepareAddress(address)
}

function prepareShippingAddress (address) {
  return prepareAddress(address)
}

function prepareAddress (address) {
  return {
    id: address.id,
    attributes: {
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      country: address.country,
      first_name: address.first_name,
      last_name: address.last_name,
      postcode: address.postcode
    },
    type: 'addresses'
  }
}

function prepareShippingMethod (shippingMethod) {
  return {
    attributes: {
      description: shippingMethod.description,
      label: shippingMethod.label,
      meta_attributes: shippingMethod.meta_attributes,
      reference: shippingMethod.reference,
      sku: shippingMethod.sku,
      sub_total: shippingMethod.sub_total,
      tax: shippingMethod.tax,
      tax_rate: shippingMethod.tax_rate,
      total: shippingMethod.total
    },
    id: shippingMethod.id,
    type: 'shipping_methods'
  }
}

function prepareDiscountSummaries (cart, lineItems) {
  return cart.discount_summaries.map(discountSummary => {
    const lineItemDiscounts = lineItems.map(lineItem => {
      return lineItem.attributes.line_item_discounts.filter(lineItemDiscount => lineItemDiscount.attributes.promotion_id === discountSummary.promotion_id)
    }).flat()

    return {
      id: discountSummary.id,
      type: 'discount_summaries',
      attributes: {
        promotion_id: discountSummary.promotion_id,
        name: discountSummary.name,
        amount_ex_tax: lineItemDiscounts.reduce((sum, discount) => sum + discount.attributes.amount_ex_tax, 0),
        amount_inc_tax: lineItemDiscounts.reduce((sum, discount) => sum + discount.attributes.amount_inc_tax, 0)
      }
    }
  })
}

function roundDecimals (order) {
  order.attributes.line_items_resources.forEach(lineItem => {
    lineItem.attributes.each_ex_tax = decimalFloat(lineItem.attributes.each_ex_tax)
    lineItem.attributes.each_inc_tax = decimalFloat(lineItem.attributes.each_inc_tax)
    lineItem.attributes.pre_discount_line_total_ex_tax = decimalFloat(lineItem.attributes.pre_discount_line_total_ex_tax)
    lineItem.attributes.pre_discount_line_total_inc_tax = decimalFloat(lineItem.attributes.pre_discount_line_total_inc_tax)
    lineItem.attributes.line_discount_ex_tax = decimalFloat(lineItem.attributes.line_discount_ex_tax)
    lineItem.attributes.line_discount_inc_tax = decimalFloat(lineItem.attributes.line_discount_inc_tax)
    lineItem.attributes.line_total_ex_tax = decimalFloat(lineItem.attributes.line_total_ex_tax)
    lineItem.attributes.line_total_inc_tax = decimalFloat(lineItem.attributes.line_total_inc_tax)

    lineItem.attributes.line_item_discounts.forEach(discount => {
      discount.attributes.amount_ex_tax = decimalFloat(discount.attributes.amount_ex_tax)
      discount.attributes.amount_inc_tax = decimalFloat(discount.attributes.amount_inc_tax)
    })
  })

  order.attributes.discount_summaries.forEach(discount => {
    discount.attributes.amount_ex_tax = decimalFloat(discount.attributes.amount_ex_tax)
    discount.attributes.amount_inc_tax = decimalFloat(discount.attributes.amount_inc_tax)
  })

  order.attributes.total_inc_tax = decimalFloat(order.attributes.total_inc_tax)
  order.attributes.total_ex_tax = decimalFloat(order.attributes.total_ex_tax)
  order.attributes.pre_discount_line_items_total_ex_tax = decimalFloat(order.attributes.pre_discount_line_items_total_ex_tax)
  order.attributes.pre_discount_line_items_total_inc_tax = decimalFloat(order.attributes.pre_discount_line_items_total_inc_tax)
  order.attributes.order_discount_ex_tax = decimalFloat(order.attributes.order_discount_ex_tax)
  order.attributes.order_discount_inc_tax = decimalFloat(order.attributes.order_discount_inc_tax)
  order.attributes.total_discount_ex_tax = decimalFloat(order.attributes.total_discount_ex_tax)
  order.attributes.total_discount_inc_tax = decimalFloat(order.attributes.total_discount_inc_tax)
  order.attributes.shipping_total = decimalFloat(order.attributes.shipping_total)
  order.attributes.shipping_discount = decimalFloat(order.attributes.shipping_discount)

  return order
}

function decimalFloat (number) {
  return parseFloat(decimalPrice(number))
}
