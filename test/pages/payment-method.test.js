// Libraries
import Router from 'next/router'

// Pages
import PaymentMethodPage from '../../src/pages/checkout/payment-method'

// Actions
import * as CheckoutActions from '../../src/actions/checkout-actions'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

const cart = {
  line_items: [
    {
      id: '1'
    }
  ],
  line_items_count: 1,
  shipping_address: {},
  shipping_method: {}
}

describe('componentDidMount()', () => {
  test('sets loading to false in state when instantiated', () => {
    // Arrange
    const cartState = {}
    const checkoutState = {}

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />)
    wrapper.instance().componentDidMount()

    // Assert
    expect(wrapper.instance().state.loading).toBe(false)
    expect(wrapper).toIncludeText('Payment Method')
  })

  test('renders correct checkout components', () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })
    
    // Assert
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('PaymentMethods').length).toEqual(1)
  })
})

describe('nextSection()', () => {
  test('navigates to shipping address when called', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })
    await wrapper.instance().nextSection()

    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-address')
    pushSpy.mockRestore()
  })
})

describe('pageTitle()', () => {
  test('retuirns the correct page title', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })
    const pageTitle = await wrapper.instance().pageTitle()

    // Assert
    expect(pageTitle).toEqual('Payment Method')
  })
})

describe('currentStep()', () => {
  test('returns the correct checkout step', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })
    const currentStep = await wrapper.instance().currentStep()

    // Assert
    expect(currentStep).toEqual('Payment Method')
  })
})

describe('continueButtonProps()', () => {
  test('returns null as we do not display the continue button', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })
    const continueButtonProps = await wrapper.instance().continueButtonProps()

    // Assert
    expect(continueButtonProps).toEqual(null)
  })
})

describe('handleSetPaymentMethod()', () => {
  test('dispatches setPaymentMethod action', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const setPaymentMethodSpy = jest.spyOn(CheckoutActions, 'setPaymentMethod').mockImplementation(() => 'setPaymentMethodAction')

    // Act
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })
    await wrapper.instance().handleSetPaymentMethod()

    // Assert
    expect(setPaymentMethodSpy).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith('setPaymentMethodAction')
  })
})
