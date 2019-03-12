// Libraries
import { Component } from 'react'
import Router from 'next/router'

// Components
import { withCheckout } from '../../src/components/with-checkout.js'

// Actions
import * as CartActions from '../../src/actions/cart-actions'

describe('componentDidMount()', () => {
  test('reads the cart and sets loading to false when line items are present', async () => {
    const WrappedComponent = withCheckout(Component)
    const cart = {
      line_items_count: 1
    }

    const readCartSpy = jest.spyOn(CartActions, 'readCart').mockImplementation(() => 'readCartAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = mount(<WrappedComponent cart={cart} dispatch={dispatch} />, { disableLifecycleMethods: true })

    await wrapper.instance().componentDidMount()

    expect(readCartSpy).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith('readCartAction')
    expect(wrapper.state().loading).toBe(false)

    readCartSpy.mockRestore()
  })

  test('reads the cart and redirects to /cart when there are no line items', async () => {
    const WrappedComponent = withCheckout(Component)
    const cart = {
      line_items_count: 0
    }

    const readCartSpy = jest.spyOn(CartActions, 'readCart').mockImplementation(() => 'readCartAction')
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = mount(<WrappedComponent cart={cart} dispatch={dispatch} />, { disableLifecycleMethods: true })

    await wrapper.instance().componentDidMount()

    expect(readCartSpy).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith('readCartAction')
    expect(pushSpy).toHaveBeenCalledWith('/cart')

    readCartSpy.mockRestore()
    pushSpy.mockRestore()
  })
})

test("componentDidUpdate() puts ref's button props, page title, current step and step actions in state when they change", () => {
  const cart = {
    line_items_count: 1
  }
  const readCartSpy = jest.spyOn(CartActions, 'readCart').mockImplementation(() => 'readCartAction')
  const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

  const WrappedComponent = withCheckout(Component)
  const wrapper = mount(<WrappedComponent cart={cart} dispatch={dispatch} />)
  wrapper.instance().wrappedRef.current = {
    continueButtonProps: () => ({ key: 'button props' }),
    pageTitle: () => 'title',
    currentStep: () => 5,
    stepActions: () => ({ key: 'step actions' })
  }

  wrapper.instance().componentDidUpdate()

  expect(wrapper.state()).toEqual(expect.objectContaining({
    continueButtonProps: { key: 'button props' },
    pageTitle: 'title',
    currentStep: 5,
    stepActions: { key: 'step actions' }
  }))

  readCartSpy.mockRestore()
})

test('deleteItem() makes a request to delete the line item and redirects to cart when cart becomes empty', async () => {
  const WrappedComponent = withCheckout(Component)
  const cart = {
    line_items_count: 0
  }
  const deleteLineItemSpy = jest.spyOn(CartActions, 'deleteLineItem').mockImplementation(() => 'deleteLineItemAction')
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

  const wrapper = mount(<WrappedComponent cart={cart} dispatch={dispatch} />, { disableLifecycleMethods: true })
  const mockEvent = {
    preventDefault: () => {},
    target: {
      dataset: {
        id: 10
      }
    }
  }

  await wrapper.instance().deleteItem(mockEvent)

  expect(deleteLineItemSpy).toHaveBeenCalledWith(10)
  expect(dispatch).toHaveBeenCalledWith('deleteLineItemAction')
  expect(pushSpy).toHaveBeenCalledWith('/cart')

  deleteLineItemSpy.mockRestore()
  pushSpy.mockRestore()
})

test('renders common checkout elements', () => {
  const cart = {
    id: 10,
    shipping_method: {}
  }

  const WrappedComponent = withCheckout(Component)
  const wrapper = shallow(<WrappedComponent cart={cart} order={{}} />, { disableLifecycleMethods: true })
  wrapper.setState({ loading: false })

  expect(wrapper.find('CheckoutSteps').length).toEqual(1)
  expect(wrapper.find('CheckoutCart').length).toEqual(1)
  expect(wrapper.find('CheckoutCartTotal').length).toEqual(1)
  expect(wrapper.find('CouponForm').length).toEqual(1)
  expect(wrapper.find('PaymentIcons').length).toEqual(1)
})

test('renders MiniPlaceOrder for the last checkout step', () => {
  const cart = {
    id: 10,
    shipping_method: {}
  }

  const WrappedComponent = withCheckout(Component)
  const wrapper = shallow(<WrappedComponent cart={cart} order={{}} />, { disableLifecycleMethods: true })
  wrapper.instance().wrappedRef.current = {
    convertOrder: () => {},
    isValidOrder: () => {}
  }
  wrapper.setState({ loading: false, currentStep: 4 })

  expect(wrapper.find('MiniPlaceOrder').length).toEqual(1)
})

test("doesn't render MiniPlaceOrder for steps other than last", () => {
  const cart = {
    id: 10
  }

  const WrappedComponent = withCheckout(Component)
  const wrapper = shallow(<WrappedComponent cart={cart} order={{}} />, { disableLifecycleMethods: true })
  wrapper.setState({ loading: false, currentStep: 3 })

  expect(wrapper.find('MiniPlaceOrder').length).toEqual(0)
})
