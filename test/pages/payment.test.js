// Libraries
import Cookies from 'js-cookie'
import Router from 'next/router'

// Pages
import CheckoutPaymentPage from '../../src/pages/payment'

// Actions
import * as AddressBookActions from '../../src/actions/address-book-actions'
import * as CartActions from '../../src/actions/cart-actions'
import * as OrderActions from '../../src/actions/order-actions'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

// Mock out Router usage in getDerivedStateFromProps
const originalRouter = Router.router

beforeAll(() => {
  Router.router = {
    asPath: ''
  }
})

afterAll(() => {
  Router.router = originalRouter
})

test('sets paymentMethod in state when instantiated', () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  const cartState = {
    shipping_address: { id: 99 },
    billing_address: { id: 99 },
    shipping_method: { id: 99 }
  }
  const checkoutState = {}
  const thirdPartyPaymentMethodOptions = ['PayPal']
  const setCurrentStep = jest.fn()

  // Act
  const wrapper = shallow(
    <CheckoutPaymentPage cart={cartState} checkout={checkoutState} setCurrentStep={setCurrentStep} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>,
    { disableLifecycleMethods: true }
  )

  // Assert
  expect(wrapper.instance().state.paymentMethod).toBe('PayPal')
  cookieSpy.mockRestore()
  pushSpy.mockRestore()
})

describe('componentDidMount()', () => {
  test('redirects to the shipping address page when one is not set when the default payment option is used', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'Credit/Debit Card')
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const cartState = {}
    const checkoutState = {}
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(
      <CheckoutPaymentPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>,
      { disableLifecycleMethods: true }
    )
  
    // Act
    wrapper.instance().componentDidMount()
  
    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-address')
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })
  
  test('redirects to the shipping address page when one is not set when third party payment is used', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const cartState = {}
    const checkoutState = {}
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(
      <CheckoutPaymentPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>,
      { disableLifecycleMethods: true }
    )

    // Act  
    wrapper.instance().componentDidMount()

    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/payment-method')
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })

  test('redirects to the order review page when when third party payment is used', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cartState = {
      shipping_address: { id: 99 },
      shipping_method: { id: 99 },
      billing_address: { id: 99 }
    }
    const checkoutState = {}
    const setCurrentStep = jest.fn()
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(
      <CheckoutPaymentPage cart={cartState} checkout={checkoutState} setCurrentStep={setCurrentStep} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} dispatch={dispatch}/>,
      { disableLifecycleMethods: true }
    )

    // Act  
    wrapper.instance().componentDidMount()

    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/payment', '/checkout/review')
    expect(wrapper.state().reviewStep).toBe(true)
    expect(setCurrentStep).toHaveBeenCalledWith(5)
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })

  test('redirects to the shipping method page when one is not set', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'Credit/Debit Card')
    const cartState = { shipping_address: {} }
    const checkoutState = {}
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(
      <CheckoutPaymentPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />,
      { disableLifecycleMethods: true }
    )
  
    // Act
    wrapper.instance().componentDidMount()
  
    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-method')
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })

  test('sets loading to false in state when user is not logged in', async () => {
    // Arrange
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

    // Act
    await wrapper.instance().componentDidMount()

    // Assert
    expect(wrapper.instance().state.loading).toBe(false)
  })

  test('fetches the address book when user is logged in', async () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook').mockImplementation(() => 'fetchAddressBookAction')
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

    // Act
    await wrapper.instance().componentDidMount()

    // Assert
    expect(dispatch).toHaveBeenCalledWith('fetchAddressBookAction')
    expect(fetchAddressBookSpy).toHaveBeenCalled()

    cookieSpy.mockRestore()
    fetchAddressBookSpy.mockRestore()
  })

  test('sets billingAsShipping to true in state when billing and shipping addresses are the same', async () => {
    // Arrange
    const cart = {
      shipping_address: { id: 99 },
      shipping_method: {},
      billing_address: { id: 99 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

    // Act
    await wrapper.instance().componentDidMount()

    // Assert
    expect(wrapper.instance().state.billingAsShipping).toBe(true)
    expect(wrapper.instance().state.loading).toBe(false)
  })

  test("sets the billing address to shipping address if cart doesn't have a billing address yet", async () => {
    // Arrange
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const cart = {
      shipping_address: { id: 99 },
      shipping_method: {}
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

    // Act
    await wrapper.instance().componentDidMount()

    // Assert
    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(99)
    expect(wrapper.instance().state.billingAsShipping).toBe(true)
    expect(wrapper.instance().state.loading).toBe(false)

    setCartBillingAddressSpy.mockRestore()
  })
})

describe('changeBillingAsShipping()', () => {
  test('sets billing address as shipping address when checkbox is being checked', async () => {
    // Arrange
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const cart = {
      shipping_address: { id: 99 },
      shipping_method: {}
    }
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} dispatch={dispatch} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

    // Act
    await wrapper.instance().changeBillingAsShipping({ target: { checked: true } })

    // Assert
    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(99)
    expect(wrapper.instance().state.billingAsShipping).toBe(true)

    setCartBillingAddressSpy.mockRestore()
  })

  describe('when checkbox is being unchecked', () => {
    test('sets billing address to preferred billing address from address book when there is one', async () => {
      // Arrange
      const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
      const cart = {
        shipping_address: { id: 99 },
        shipping_method: {}
      }
      const checkoutState = {
        addressBook: [{
          id: 10
        }, {
          id: 123,
          preferred_billing: true
        }],
        paymentMethod: 'Credit/Debit Card'
      }
      const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
      const thirdPartyPaymentMethodOptions = ['PayPal']
      const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} dispatch={dispatch} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

      // Act
      await wrapper.instance().changeBillingAsShipping({ target: { checked: false } })

      // Assert
      expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
      expect(setCartBillingAddressSpy).toHaveBeenCalledWith(123)
      expect(wrapper.instance().state.billingAsShipping).toBe(false)

      setCartBillingAddressSpy.mockRestore()
    })

    test("sets billing address to first address from address book when there isn't a preffered one", async () => {
      // Arrange
      const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
      const cart = {
        shipping_address: { id: 99 },
        shipping_method: {}
      }
      const checkoutState = {
        addressBook: [{
          id: 10
        }, {
          id: 123
        }],
        paymentMethod: 'Credit/Debit Card'
      }
      const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
      const thirdPartyPaymentMethodOptions = ['PayPal']
      const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} dispatch={dispatch} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

      // Act
      await wrapper.instance().changeBillingAsShipping({ target: { checked: false } })

      // Assert
      expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
      expect(setCartBillingAddressSpy).toHaveBeenCalledWith(10)
      expect(wrapper.instance().state.billingAsShipping).toBe(false)

      setCartBillingAddressSpy.mockRestore()
    })

    test('starts adding a new billing address when address book is empty', async () => {
      // Arrange
      const cart = {
        shipping_address: {},
        shipping_method: {}
      }
      const checkoutState = {
        addressBook: [],
        paymentMethod: 'Credit/Debit Card'
      }
      const thirdPartyPaymentMethodOptions = ['PayPal']
      const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

      // Act
      await wrapper.instance().changeBillingAsShipping({ target: { checked: false } })

      // Assert
      expect(wrapper.instance().state.billingAsShipping).toBe(false)
      expect(wrapper.instance().state.addingNewAddress).toBe(true)
    })
  })
})

describe('onCardTokenReceived()', () => {
  test('sets payment errors when errors are present', async () => {
    // Act
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const setPaymentErrorSpy = jest.spyOn(OrderActions, 'setPaymentError').mockImplementation(() => 'setPaymentErrorAction')
    const requestCardTokenSpy = jest.spyOn(OrderActions, 'requestCardToken').mockImplementation(() => 'requestCardTokenAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

    // Act
    await wrapper.instance().onCardTokenReceived({
      error: { message: 'test error' }
    })

    // Assert
    expect(setPaymentErrorSpy).toHaveBeenCalledWith('test error')
    expect(requestCardTokenSpy).toHaveBeenCalledWith(false)
    expect(dispatch).toHaveBeenCalledWith('setPaymentErrorAction')
    expect(dispatch).toHaveBeenCalledWith('requestCardTokenAction')

    setPaymentErrorSpy.mockRestore()
    requestCardTokenSpy.mockRestore()
  })

  test('sets the card token using the seleected shipping method and redirects to /order', async () => {
    // Arrange
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const setCardTokenSpy = jest.spyOn(OrderActions, 'setCardToken').mockImplementation(() => 'setCardTokenAction')
    const requestCardTokenSpy = jest.spyOn(OrderActions, 'requestCardToken').mockImplementation(() => 'requestCardTokenAction')
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>)
   
    // Act
    wrapper.setState({ selectedPaymentMethod: 'card' })
    await wrapper.instance().onCardTokenReceived({
      token: 'test token'
    })

    // Assert
    expect(setCardTokenSpy).toHaveBeenCalledWith('test token', 'card')
    expect(requestCardTokenSpy).toHaveBeenCalledWith(false)
    expect(pushSpy).toHaveBeenCalledWith('/order')
    expect(dispatch).toHaveBeenCalledWith('setCardTokenAction')
    expect(dispatch).toHaveBeenCalledWith('requestCardTokenAction')

    setCardTokenSpy.mockRestore()
    requestCardTokenSpy.mockRestore()
    pushSpy.mockRestore()
  })
})

describe('addressFormDisplayed()', () => {
  test('returns true when addressBook is empty', () => {
    // Arrange
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage checkout={checkoutState} cart={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })

  test('returns true when adding new address is set in state', () => {
    // Arrange
    const checkoutState = {
      addressBook: [{ id: 1 }],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage checkout={checkoutState} cart={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
   
    // Act
    wrapper.setState({ addingNewAddress: true })

    // Assert
    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })

  test('returns true when address is not from the address book', () => {
    // Arrange
    const checkoutState = {
      addressBook: [{ id: 1 }],
      paymentMethod: 'Credit/Debit Card'
    }
    const cart = {
      billing_address: {
        id: 2
      }
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage checkout={checkoutState} cart={cart} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })
})

describe('cartAddressFromBook()', () => {
  test('returns false when customer is not logged in', () => {
    // Arrange
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']
  
    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().cartAddressFromBook()).toBe(false)
  })

  test("returns false when cart doesn't have a shipping address", () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
  
    // Assert
    expect(wrapper.instance().cartAddressFromBook()).toBe(false)
    cookieSpy.mockRestore()
  })

  test('returns false when shipping address is not from the address book', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkoutState = {
      addressBook: [{ id: 1 }],
      paymentMethod: 'Credit/Debit Card'
    }
    const cart = {
      shipping_address: {
        id: 10
      }
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().cartAddressFromBook()).toBe(false)
    cookieSpy.mockRestore()
  })

  test('returns true when billing address is from the address book', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkoutState = {
      addressBook: [{ id: 10 }],
      paymentMethod: 'Credit/Debit Card'
    }
    const cart = {
      billing_address: {
        id: 10
      }
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().cartAddressFromBook()).toBe(true)
    cookieSpy.mockRestore()
  })
})

describe('nextStepAvailable()', () => {
  test('returns false when there are card errors', () => {
    // Arrange
    const order = {
      card_errors: ['error']
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} order={order} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().nextStepAvailable()).toBe(false)
  })

  test('returns true when billing address comes from the address book and there is no card errors', () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const cart = {
      billing_address: {
        id: 10
      }
    }
    const checkoutState = {
      addressBook: [{
        id: 10
      }],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().nextStepAvailable()).toBe(true)
    cookieSpy.mockRestore()
  })

  test('returns true when billing address is the same as shipping address and there is no card errors', () => {
    // Arrange
    const cart = {
      billing_address: {
        id: 10
      },
      shipping_address: {
        id: 10
      }
    }
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']
  
    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().nextStepAvailable()).toBe(true)
  })

  test('returns false when new address is being added and it is invalid', () => {
    // Arrange
    const cart = {
      billing_address: {
        id: 10
      },
      shipping_address: {
        id: 10
      }
    }
    const checkoutState = {
      addressBook: [],
      billingAddress: {
        errors: {}
      },
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    // Assert
    expect(wrapper.instance().nextStepAvailable()).toBe(false)
  })

  test('returns true when new address is being added and it is valid', () => {
    // Arrange
    const cart = {
      billing_address: {
        id: 10
      },
      shipping_address: {
        id: 10
      }
    }
    const checkoutState = {
      addressBook: [],
      billingAddress: {
        errors: {},
        line_1: 'Queen Street',
        zipcode: 'LS27EY',
        city: 'Leeds',
        primary_phone: '12312312312',
        email: 'test@example.com'
      },
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    // Assert
    expect(wrapper.instance().nextStepAvailable()).toBe(true)
  })
})

describe('nextSection()', () => {
  test('navigates to the review step when shipping address is from the address book', async () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const cart = {
      billing_address: {
        id: 10
      }
    }
    const checkoutState = {
      addressBook: [{
        id: 10
      }],
      paymentMethod: 'Credit/Debit Card'
    }
    const setCurrentStep = jest.fn()
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage
      cart={cart}
      checkout={checkoutState}
      setCurrentStep={setCurrentStep}
      thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}
    />, { disableLifecycleMethods: true })

    // Act
    await wrapper.instance().nextSection()

    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/payment', '/checkout/review')
    expect(wrapper.state().reviewStep).toBe(true)
    expect(setCurrentStep).toHaveBeenCalledWith(5)
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })

  test('saves new address to address book and sets it on cart', async () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const saveToAddressBookSpy = jest.spyOn(AddressBookActions, 'saveToAddressBook').mockImplementation(() => 'saveToAddressBookAction')
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cart = {
      billing_address: {
        id: 20
      }
    }
    const checkoutState = {
      billingAddress: {
        id: 20,
        saveToAddressBook: true
      },
      paymentMethod: 'Credit/Debit Card'
    }
    const setCurrentStep = jest.fn()
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage
      cart={cart}
      checkout={checkoutState}
      dispatch={dispatch}
      setCurrentStep={setCurrentStep}
      thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}
    />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    // Act
    await wrapper.instance().nextSection()

    // Assert
    expect(saveToAddressBookSpy).toHaveBeenCalledWith(checkoutState.billingAddress)
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(20)
    expect(dispatch).toHaveBeenCalledWith('saveToAddressBookAction')
    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    expect(pushSpy).toHaveBeenCalledWith('/checkout/payment', '/checkout/review')
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
    saveToAddressBookSpy.mockRestore()
    setCartBillingAddressSpy.mockRestore()
  })

  test('creates new addresses and sets them on cart', async () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const createBillingAddressSpy = jest.spyOn(CartActions, 'createBillingAddress').mockImplementation(() => 'createBillingAddressAction')
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cart = {
      billing_address: {
        id: 20
      }
    }
    const checkoutState = {
      billingAddress: {
        id: 20
      },
      paymentMethod: 'Credit/Debit Card'
    }
    const setCurrentStep = jest.fn()
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage
      cart={cart}
      checkout={checkoutState}
      dispatch={dispatch}
      setCurrentStep={setCurrentStep}
      thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}
    />, { disableLifecycleMethods: true })

    // Act
    wrapper.setState({ addingNewAddress: true })
    await wrapper.instance().nextSection()

    // Assert
    expect(createBillingAddressSpy).toHaveBeenCalledWith(checkoutState.billingAddress)
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(20)
    expect(dispatch).toHaveBeenCalledWith('createBillingAddressAction')
    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    expect(pushSpy).toHaveBeenCalledWith('/checkout/payment', '/checkout/review')
    cookieSpy.mockRestore()
    pushSpy.mockRestore()
    createBillingAddressSpy.mockRestore()
    setCartBillingAddressSpy.mockRestore()
  })
})

describe('isValidOrder()', () => {
  test('returns false when order has card errors', () => {
    // Arrange
    const order = {
      card_errors: { key: 'value' }
    }
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} checkout={checkoutState}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns false when shipping address is missing', () => {
    // Arrange
    const order = {}
    const cart = {
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns false when billing address is missing', () => {
    // Arrange
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      shipping_method: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns false when shipping method is missing', () => {
    // Arrange
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns true for valid orders', () => {
    // Arrange
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.instance().isValidOrder(cart, order)).toBe(true)
  })
})

describe('convertToOrder()', () => {
  test('requests card token when paying by card', () => {
    // Arrange
    const requestCardTokenSpy = jest.spyOn(OrderActions, 'requestCardToken').mockImplementation(() => 'requestCardTokenAction')
    const dispatch = jest.fn()
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} dispatch={dispatch} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    
    // Act
    wrapper.setState({ selectedPaymentMethod: 'card' })
    wrapper.instance().convertToOrder()

    // Assert
    expect(requestCardTokenSpy).toHaveBeenCalledWith(true)
    expect(dispatch).toHaveBeenCalledWith('requestCardTokenAction')
    requestCardTokenSpy.mockRestore()
  })
})

describe('continueButtonProps()', () => {
  test('returns an enabled Place Order button props when at review step and order is valid', () => {
    // Arrange
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} order={order} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    
    // Act
    wrapper.setState({ reviewStep: true })

    // Assert
    const continueButtonProps = wrapper.instance().continueButtonProps()
    expect(continueButtonProps.label).toEqual('Place Order')
    expect(continueButtonProps.disabled).toBe(false)
  })

  test('returns a disabled Place Order button props when at review step and order is invalid', () => {
    // Arrange
    const order = { card_errors: { key: 'value' } }
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} order={order} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    
    // Act
    wrapper.setState({ reviewStep: true })

    // Assert
    const continueButtonProps = wrapper.instance().continueButtonProps()
    expect(continueButtonProps.label).toEqual('Place Order')
    expect(continueButtonProps.disabled).toBe(true)
  })

  test('returns a Review Your Order button props when at payment step', () => {
    // Arrange
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 }
    }
    const checkoutState = {
      billingAddress: {},
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    const continueButtonProps = wrapper.instance().continueButtonProps()
    expect(continueButtonProps.label).toEqual('Review Your Order')
  })
})

describe('pageTitle()', () => {
  test('returns correct title for the payment step', () => {
    // Arrange
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Act
    const pageTitle = wrapper.instance().pageTitle()

    // Assert
    expect(pageTitle).toEqual('Checkout - Payment')
  })

  test('returns correct title for the review step', () => {
    // Arrange
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Act
    wrapper.setState({ reviewStep: true })

    // Assert
    expect(wrapper.instance().pageTitle()).toEqual('Checkout - Review')
  })
})

describe('currentStep()', () => {
  test('returns correct step for the payment step', () => {
    // Arrange
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Act
    const currentStep = wrapper.instance().currentStep()

    // Assert
    expect(currentStep).toEqual(4)
  })

  test('returns correct step for the review step', () => {
    // Arrange
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    
    // Act
    wrapper.setState({ reviewStep: true })

    // Assert
    expect(wrapper.instance().currentStep()).toEqual(5)
  })
})

describe('render()', () => {
  test('renders a loading indicator when loading data', () => {
    // Arrange
    const checkoutState = { paymentMethod: 'Credit/Debit Card' }
    const thirdPartyPaymentMethodOptions = ['PayPal']

    // Act
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Assert
    expect(wrapper.find('Loading')).toBeTruthy()
    expect(wrapper.find('AddressFormSummary').length).toEqual(0)
    expect(wrapper.find('ShippingMethodsSummary').length).toEqual(0)
    expect(wrapper.find('PaymentMethod').length).toEqual(0)
    expect(wrapper.find('PaymentMethodSummary').length).toEqual(0)
  })

  test('renders correct checkout components', () => {
    // Arrange
    const cart = {
      shipping_address: {}
    }
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    
    // Act
    wrapper.setState({ loading: false })

    // Assert
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('AddressFormSummary').length).toEqual(1)
    expect(wrapper.find('ShippingMethodsSummary').length).toEqual(1)
    expect(wrapper.find('PaymentMethod').length).toEqual(1)
    expect(wrapper.find('PaymentMethodSummary').length).toEqual(0)
  })

  test('displays payment method selection when at payment step', () => {
    // Arrange 
    const cart = {
      shipping_address: {}
    }
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })
    
    // Act
    wrapper.setState({ loading: false })

    // Assert
    expect(wrapper.find('PaymentMethod').length).toEqual(1)
    expect(wrapper.find('PaymentMethodSummary').length).toEqual(0)
  })

  test('displays payment method summary when at payment step', () => {
    // Arrange
    const cart = {
      shipping_address: {}
    }
    const checkoutState = {
      addressBook: [],
      paymentMethod: 'Credit/Debit Card'
    }
    const thirdPartyPaymentMethodOptions = ['PayPal']
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkoutState} order={{}} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>, { disableLifecycleMethods: true })

    // Act
    wrapper.setState({
      loading: false,
      reviewStep: true
    })

    // Assert
    expect(wrapper.find('PaymentMethod').length).toEqual(0)
    expect(wrapper.find('PaymentMethodSummary').length).toEqual(1)
  })
})
