// Libraries
import Cookies from 'js-cookie'

// Lib
import ApiClient from '../lib/api-client'

// Actions
import * as actionTypes from './action-types'
import { readEndpoint, postEndpoint } from './api-actions'

const fetchCartRequest = {
  endpoint: '/getCart',
  successActionType: actionTypes.CART_UPDATED
}

export function readCart (options = {}) {
  return (dispatch, getState) => {
    // Only fetch the cart if needed, otherwise do nothing
    if ((Cookies.get('cart') && !getState().cart.id) || options.force) {
      return dispatch(readEndpoint(fetchCartRequest))
    } else {
      return Promise.resolve()
    }
  }
}

const addToCartRequest = (variantId, quantity) => {
  return {
    endpoint: '/addToCart',
    body: { variantId, quantity },
    successActionType: actionTypes.CART_UPDATED
  }
}

export function addToCart (variantId, quantity) {
  return postEndpoint(addToCartRequest(variantId, quantity))
}

const updateLineItemQuantityRequest = (lineItemId, newQuantity) => {
  return {
    endpoint: '/updateLineItem',
    body: { lineItemId, newQuantity },
    successActionType: actionTypes.CART_UPDATED
  }
}

export function updateLineItemQuantity (lineItemId, newQuantity) {
  return postEndpoint(updateLineItemQuantityRequest(lineItemId, newQuantity))
}

const deleteLineItemRequest = (lineItemId) => {
  return {
    endpoint: `/deleteLineItem/${lineItemId}`,
    successActionType: actionTypes.CART_UPDATED
  }
}

export function deleteLineItem (lineItemId) {
  return postEndpoint(deleteLineItemRequest(lineItemId))
}

const addCartCouponRequest = (couponCode) => {
  return {
    endpoint: '/addCartCoupon',
    body: { couponCode }
  }
}

export const fetchShippingMethodsRequest = () => {
  return {
    endpoint: '/getShippingMethods'
  }
}

const setShippingMethodRequest = (shippingMethodId) => {
  return {
    endpoint: '/setShippingMethod',
    body: { shippingMethodId },
    successActionType: actionTypes.CART_UPDATED
  }
}

export function setCartShippingMethod (shippingMethodId) {
  return postEndpoint(setShippingMethodRequest(shippingMethodId))
}

export async function submitCoupon (couponCode) {
  const request = addCartCouponRequest(couponCode)
  const response = await new ApiClient().post(request.endpoint, request.body)
  if (response.status === 201) {
    return response.data
  }
  throw response.data
}

export function setAPIError (error, setErrors) {
  setErrors({ couponCode: error[0]['title'] })
}

const setBillingAddressRequest = (addressId) => {
  return {
    endpoint: '/setCartBillingAddress',
    body: { addressId },
    successActionType: actionTypes.CART_UPDATED
  }
}

export function setCartBillingAddress (addressId) {
  return postEndpoint(setBillingAddressRequest(addressId))
}

const setShippingAddressRequest = (addressId) => {
  return {
    endpoint: '/setCartShippingAddress',
    body: { addressId },
    successActionType: actionTypes.CART_UPDATED
  }
}

export function setCartShippingAddress (addressId) {
  return postEndpoint(setShippingAddressRequest(addressId))
}

const createShippingAddressRequest = (address) => {
  return {
    endpoint: '/createAddress',
    body: address,
    successActionType: actionTypes.SHIPPING_ADDRESS_CREATED
  }
}

export function createShippingAddress (address) {
  return postEndpoint(createShippingAddressRequest(address))
}

const createBillingAddressRequest = (address) => {
  return {
    endpoint: '/createAddress',
    body: address,
    successActionType: actionTypes.BILLING_ADDRESS_CREATED
  }
}

export function createBillingAddress (address) {
  return postEndpoint(createBillingAddressRequest(address))
}

export function toggleMiniBag (displayed) {
  return {
    type: actionTypes.TOGGLE_MINIBAG,
    displayed
  }
}
