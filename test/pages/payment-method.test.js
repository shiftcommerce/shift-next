// Libraries
import Router from 'next/router'

// Pages
import PaymentMethodPage from '../../src/pages/checkout/payment-method'

// Actions
import * as CheckoutActions from '../../src/actions/checkout-actions'
import * as CartActions from '../../src/actions/cart-actions'

// Fixtures
const payPalResponse = require('../fixtures/paypal-response')

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
  shipping_method: {},
  total: 10
}

const payPalBillingAddress = {
  first_name: 'test',
  last_name: 'buyer',
  email: 'testbuyer@flexcommerce.com',
  line_1: '1 Main Terrace',
  line_2: undefined,
  city: 'Wolverhampton',
  state: 'West Midlands',
  zipcode: 'W12 4LQ',
  country_code: 'GB',
  primary_phone: '0352878596',
  collapsed: true,
  completed: true,
  showEditButton: false
}

const payPalShippingAddress = {
  first_name: 'Test',
  last_name: 'Example',
  email: 'testbuyer@flexcommerce.com',
  line_1: 'Shift Commerce Ltd, Old School Boar',
  line_2: 'Calverley Street',
  city: 'Leeds',
  state: 'N/A',
  zipcode: 'LS1 3ED',
  country_code: 'GB',
  primary_phone: '0352878596',
  collapsed: true,
  completed: true,
  showEditButton: false    
}

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

describe('nextSection()', () => {
  test('navigates to shipping address when called', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })

    // Act
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
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })

    // Act
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
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })

    // Act
    const currentStep = await wrapper.instance().currentStep()

    // Assert
    expect(currentStep).toEqual(1)
  })
})

describe('continueButtonProps()', () => {
  test('returns null as we do not display the continue button', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })

    // Act
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
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} dispatch={dispatch} />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().handleSetPaymentMethod()

    // Assert
    expect(setPaymentMethodSpy).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith('setPaymentMethodAction')
  })
})

describe('payPalCreateOrder()', () => {
  test('calls the actions for creating the PayPal Order', async () => {
    // Arrange    
    const cartState = cart
    const checkoutState = {}
    const data = {}
    const actions = {
      order: {
        create: jest.fn(() => Promise.resolve())
      }
    }
    const payPalPayload = {
      purchase_units: [{
        amount: {
          value: cartState.total
        }
      }]
    }
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().payPalCreateOrder(data, actions)

    // Assert
    expect(actions.order.create).toHaveBeenCalledWith(payPalPayload)
  })
})

describe('payPalOnApprove()', () => {
  test('fetches the created PayPal order', async () => {
    // Arrange    
    const cartState = cart
    const checkoutState = {}
    const data = {}
    const actions = {
      order: {
        get: jest.fn(() => Promise.resolve(payPalResponse))
      }
    }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} dispatch={dispatch} />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().payPalOnApprove(data, actions)

    // Assert
    expect(actions.order.get).toHaveBeenCalled()
  })
})

describe('handlePayPalOrderResponse()', () => {
  test('dispatches the actions expected', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const payPalOrder = payPalResponse
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} dispatch={dispatch} />, { disableLifecycleMethods: true })
    const handleBillingAddressCreationSpy = jest.spyOn(wrapper.instance(), 'handleBillingAddressCreation')
    const handleShippingAddressCreationSpy = jest.spyOn(wrapper.instance(), 'handleShippingAddressCreation')

    // Act
    await wrapper.instance().handlePayPalOrderResponse(payPalOrder)

    // Assert
    expect(handleBillingAddressCreationSpy).toHaveBeenCalledWith(payPalBillingAddress)
    expect(handleShippingAddressCreationSpy).toHaveBeenCalledWith(payPalShippingAddress)
    handleBillingAddressCreationSpy.mockRestore()
    handleShippingAddressCreationSpy.mockRestore()
  })
})

describe('parsePayPalAddress()', () => {
  test('parses a PayPal address into the expected format', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const payer = payPalResponse.payer
    const expectedAdress = {
      first_name: 'test',
      last_name: 'buyer',
      email: 'testbuyer@flexcommerce.com',
      line_1: '1 Main Terrace',
      line_2: undefined,
      city: 'Wolverhampton',
      state: 'West Midlands',
      zipcode: 'W12 4LQ',
      country_code: 'GB',
      primary_phone: '0352878596',
      collapsed: true,
      completed: true,
      showEditButton: false
    }
    const setCurrentStep = jest.fn().mockImplementation(() => {})
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} setCurrentStep={setCurrentStep}/>, { disableLifecycleMethods: true })

    // Act
    const parsedAddress = await wrapper.instance().parsePayPalAddress(
      payer.name.given_name,
      payer.name.surname,
      payer.email_address,
      payer.phone.phone_number.national_number,
      payer.address
    )

    // Assert
    expect(parsedAddress).toEqual(expectedAdress)
  })
})

describe('handleBillingAddressCreation()', () => {
  test('creates new billing address and sets them on cart', async () => {
    // Arrange
    const setCheckoutBillingAddressSpy = jest.spyOn(CheckoutActions, 'setCheckoutBillingAddress').mockImplementation(() => 'setCheckoutBillingAddressAction')
    const createBillingAddressSpy = jest.spyOn(CartActions, 'createBillingAddress').mockImplementation(() => 'createBillingAddressAction')
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cart = {
      billingAddress: {
        id: 20
      }
    }
    const newBillingAddress = {
      first_name: 'test',
      last_name: 'buyer',
      email: 'testbuyer@flexcommerce.com',
      line_1: '1 Main Terrace',
      line_2: '',
      city: 'Wolverhampton',
      state: 'West Midlands',
      zipcode: 'W12 4LQ',
      country_code: 'GB',
      primary_phone: '0352878596',
      collapsed: true,
      completed: true,
      showEditButton: false
    }
    const checkout = {
      billingAddress: {
        id: 20
      }
    }
    const wrapper = shallow(<PaymentMethodPage cart={cart} checkout={checkout} dispatch={dispatch} />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().handleBillingAddressCreation(newBillingAddress)

    // Assert
    expect(setCheckoutBillingAddressSpy).toHaveBeenCalledWith(newBillingAddress)
    expect(createBillingAddressSpy).toHaveBeenCalledWith(newBillingAddress)
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(20)
    expect(dispatch).toHaveBeenCalledWith('setCheckoutBillingAddressAction')
    expect(dispatch).toHaveBeenCalledWith('createBillingAddressAction')
    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    setCheckoutBillingAddressSpy.mockRestore()
    createBillingAddressSpy.mockRestore()
    setCartBillingAddressSpy.mockRestore()
  })
})

describe('handleShippingAddressCreation()', () => {
  test('creates new shipping address and sets them on cart', async () => {
    // Arrange
    const setCheckoutShippingAddressSpy = jest.spyOn(CheckoutActions, 'setCheckoutShippingAddress').mockImplementation(() => 'setCheckoutShippingAddressAction')
    const createShippingAddressSpy = jest.spyOn(CartActions, 'createShippingAddress').mockImplementation(() => 'createShippingAddressAction')
    const setCartShippingAddressSpy = jest.spyOn(CartActions, 'setCartShippingAddress').mockImplementation(() => 'setCartShippingAddressAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cart = {
      shipping_address: {
        id: 20
      }
    }
    const newShippingAddress = {
      first_name: 'Test',
      last_name: 'Example',
      email: 'testbuyer@flexcommerce.com',
      line_1: 'Shift Commerce Ltd, Old School Boar',
      line_2: 'Calverley Street',
      city: 'Leeds',
      state: 'N/A',
      zipcode: 'LS1 3ED',
      country_code: 'GB',
      primary_phone: '0352878596',
      collapsed: true,
      completed: true,
      showEditButton: false  
    }
    const checkout = {
      shippingAddress: {
        id: 20
      }
    }
    const wrapper = shallow(<PaymentMethodPage cart={cart} checkout={checkout} dispatch={dispatch} />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().handleShippingAddressCreation(newShippingAddress)

    // Assert
    expect(setCheckoutShippingAddressSpy).toHaveBeenCalledWith(newShippingAddress)
    expect(createShippingAddressSpy).toHaveBeenCalledWith(newShippingAddress)
    expect(setCartShippingAddressSpy).toHaveBeenCalledWith(20)
    expect(dispatch).toHaveBeenCalledWith('setCheckoutShippingAddressAction')
    expect(dispatch).toHaveBeenCalledWith('createShippingAddressAction')
    expect(dispatch).toHaveBeenCalledWith('setCartShippingAddressAction')
    setCheckoutShippingAddressSpy.mockRestore()
    createShippingAddressSpy.mockRestore()
    setCartShippingAddressSpy.mockRestore()
  })
})

describe('handlePayPalOrderDetails()', () => {
  test('dispatches setPaymentMethod action', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const payPalOrder = payPalResponse
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const setPayPalOrderDetailsSpy = jest.spyOn(CheckoutActions, 'setPayPalOrderDetails').mockImplementation(() => 'setPayPalOrderDetailsAction')
    const expectedOrderDetailsPayload = {
      orderID: payPalOrder.id,
      intent: payPalOrder.intent,
      status: payPalOrder.status,
      purchaseUnitsReferenceID: payPalOrder.purchase_units[0].reference_id,
      createdAt: payPalOrder.create_time
    }
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} dispatch={dispatch} />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().handlePayPalOrderDetails(payPalOrder)

    // Assert
    expect(setPayPalOrderDetailsSpy).toHaveBeenCalledWith(expectedOrderDetailsPayload)
    expect(dispatch).toHaveBeenCalledWith('setPayPalOrderDetailsAction')
  })
})

describe('transitionToShippingMethodSection()', () => {
  test('navigates to shipping method page when called', async () => {
    // Arrange
    const cartState = cart
    const checkoutState = {}
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const setCurrentStep = jest.fn()
    const wrapper = shallow(<PaymentMethodPage cart={cartState} checkout={checkoutState} setCurrentStep={setCurrentStep}/>, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().transitionToShippingMethodSection()

    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-method')
    expect(setCurrentStep).toHaveBeenCalledWith(3)
    pushSpy.mockRestore()
  })
})
