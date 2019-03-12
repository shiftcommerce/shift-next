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

describe('componentDidMount()', () => {
  test('redirects to the shipping address page when one is not set', () => {
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    shallow(<CheckoutPaymentPage cart={{}} />)
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-address')
    pushSpy.mockRestore()
  })

  test('redirects to the shipping method page when one is not set', () => {
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    shallow(<CheckoutPaymentPage cart={{ shipping_address: {} }} />)
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-method')
    pushSpy.mockRestore()
  })

  test('sets loading to false in state when user is not logged in', async () => {
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} />)
    await wrapper.instance().componentDidMount()

    expect(wrapper.instance().state.loading).toBe(false)
  })

  test('fetches the address book when user is logged in', async () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook').mockImplementation(() => 'fetchAddressBookAction')
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} />)
    await wrapper.instance().componentDidMount()

    expect(dispatch).toHaveBeenCalledWith('fetchAddressBookAction')
    expect(fetchAddressBookSpy).toHaveBeenCalled()

    cookieSpy.mockRestore()
    fetchAddressBookSpy.mockRestore()
  })

  test('sets billingAsShipping to true in state when billing and shipping addresses are the same', async () => {
    const cart = {
      shipping_address: { id: 99 },
      shipping_method: {},
      billing_address: { id: 99 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} />)
    await wrapper.instance().componentDidMount()
    expect(wrapper.instance().state.billingAsShipping).toBe(true)
    expect(wrapper.instance().state.loading).toBe(false)
  })

  test("sets the billing address to shipping address if cart doesn't have a billing address yet", async () => {
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const cart = {
      shipping_address: { id: 99 },
      shipping_method: {}
    }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} />)
    await wrapper.instance().componentDidMount()

    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(99)
    expect(wrapper.instance().state.billingAsShipping).toBe(true)
    expect(wrapper.instance().state.loading).toBe(false)

    setCartBillingAddressSpy.mockRestore()
  })
})

describe('changeBillingAsShipping()', () => {
  test('sets billing address as shipping address when checkbox is being checked', async () => {
    const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
    const cart = {
      shipping_address: { id: 99 },
      shipping_method: {}
    }
    const checkout = {
      addressBook: []
    }
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} dispatch={dispatch} />)
    await wrapper.instance().changeBillingAsShipping({ target: { checked: true } })

    expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
    expect(setCartBillingAddressSpy).toHaveBeenCalledWith(99)
    expect(wrapper.instance().state.billingAsShipping).toBe(true)

    setCartBillingAddressSpy.mockRestore()
  })

  describe('when checkbox is being unchecked', () => {
    test('sets billing address to preferred billing address from address book when there is one', async () => {
      const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
      const cart = {
        shipping_address: { id: 99 },
        shipping_method: {}
      }
      const checkout = {
        addressBook: [{
          id: 10
        }, {
          id: 123,
          preferred_billing: true
        }]
      }
      const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

      const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} dispatch={dispatch} />)
      await wrapper.instance().changeBillingAsShipping({ target: { checked: false } })

      expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
      expect(setCartBillingAddressSpy).toHaveBeenCalledWith(123)
      expect(wrapper.instance().state.billingAsShipping).toBe(false)

      setCartBillingAddressSpy.mockRestore()
    })

    test("sets billing address to first address from address book when there isn't a preffered one", async () => {
      const setCartBillingAddressSpy = jest.spyOn(CartActions, 'setCartBillingAddress').mockImplementation(() => 'setCartBillingAddressAction')
      const cart = {
        shipping_address: { id: 99 },
        shipping_method: {}
      }
      const checkout = {
        addressBook: [{
          id: 10
        }, {
          id: 123
        }]
      }
      const dispatch = jest.fn().mockImplementation(() => Promise.resolve())

      const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} dispatch={dispatch} />)
      await wrapper.instance().changeBillingAsShipping({ target: { checked: false } })

      expect(dispatch).toHaveBeenCalledWith('setCartBillingAddressAction')
      expect(setCartBillingAddressSpy).toHaveBeenCalledWith(10)
      expect(wrapper.instance().state.billingAsShipping).toBe(false)

      setCartBillingAddressSpy.mockRestore()
    })

    test('starts adding a new billing address when address book is empty', async () => {
      const cart = {
        shipping_address: {},
        shipping_method: {}
      }
      const checkout = {
        addressBook: []
      }

      const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} />)
      await wrapper.instance().changeBillingAsShipping({ target: { checked: false } })

      expect(wrapper.instance().state.billingAsShipping).toBe(false)
      expect(wrapper.instance().state.addingNewAddress).toBe(true)
    })
  })
})

describe('onCardTokenReceived()', () => {
  test('sets payment errors when errors are present', async () => {
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const setPaymentErrorSpy = jest.spyOn(OrderActions, 'setPaymentError').mockImplementation(() => 'setPaymentErrorAction')
    const requestCardTokenSpy = jest.spyOn(OrderActions, 'requestCardToken').mockImplementation(() => 'requestCardTokenAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} />)
    await wrapper.instance().onCardTokenReceived({
      error: { message: 'test error' }
    })

    expect(setPaymentErrorSpy).toHaveBeenCalledWith('test error')
    expect(requestCardTokenSpy).toHaveBeenCalledWith(false)
    expect(dispatch).toHaveBeenCalledWith('setPaymentErrorAction')
    expect(dispatch).toHaveBeenCalledWith('requestCardTokenAction')

    setPaymentErrorSpy.mockRestore()
    requestCardTokenSpy.mockRestore()
  })

  test('sets the card token using the seleected shipping method and redirects to /order', async () => {
    const cart = {
      shipping_address: {},
      shipping_method: {},
      billing_address: {}
    }
    const setCardTokenSpy = jest.spyOn(OrderActions, 'setCardToken').mockImplementation(() => 'setCardTokenAction')
    const requestCardTokenSpy = jest.spyOn(OrderActions, 'requestCardToken').mockImplementation(() => 'requestCardTokenAction')
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const wrapper = shallow(<CheckoutPaymentPage cart={cart} dispatch={dispatch} />)
    wrapper.setState({ selectedPaymentMethod: 'card' })
    await wrapper.instance().onCardTokenReceived({
      token: 'test token'
    })

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
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage checkout={checkout} cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })

  test('returns true when adding new address is set in state', () => {
    const checkout = {
      addressBook: [{ id: 1 }]
    }

    const wrapper = shallow(<CheckoutPaymentPage checkout={checkout} cart={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })

  test('returns true when address is not from the address book', () => {
    const checkout = {
      addressBook: [{ id: 1 }]
    }
    const cart = {
      billing_address: {
        id: 2
      }
    }

    const wrapper = shallow(<CheckoutPaymentPage checkout={checkout} cart={cart} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })
})

describe('cartAddressFromBook()', () => {
  test('returns false when customer is not logged in', () => {
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(false)
  })

  test("returns false when cart doesn't have a shipping address", () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(false)

    cookieSpy.mockRestore()
  })

  test('returns false when shipping address is not from the address book', () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkout = {
      addressBook: [{ id: 1 }]
    }
    const cart = {
      shipping_address: {
        id: 10
      }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(false)

    cookieSpy.mockRestore()
  })

  test('returns true when billing address is from the address book', () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkout = {
      addressBook: [{ id: 10 }]
    }
    const cart = {
      billing_address: {
        id: 10
      }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(true)

    cookieSpy.mockRestore()
  })
})

describe('nextStepAvailable()', () => {
  test('returns false when there are card errors', () => {
    const order = {
      card_errors: ['error']
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} checkout={{}} order={order} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().nextStepAvailable()).toBe(false)
  })

  test('returns true when billing address comes from the address book and there is no card errors', () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const cart = {
      billing_address: {
        id: 10
      }
    }
    const checkout = {
      addressBook: [{
        id: 10
      }]
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().nextStepAvailable()).toBe(true)

    cookieSpy.mockRestore()
  })

  test('returns true when billing address is the same as shipping address and there is no card errors', () => {
    const cart = {
      billing_address: {
        id: 10
      },
      shipping_address: {
        id: 10
      }
    }
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().nextStepAvailable()).toBe(true)
  })

  test('returns false when new address is being added and it is invalid', () => {
    const cart = {
      billing_address: {
        id: 10
      },
      shipping_address: {
        id: 10
      }
    }
    const checkout = {
      addressBook: [],
      billingAddress: {
        errors: {}
      }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    expect(wrapper.instance().nextStepAvailable()).toBe(false)
  })

  test('returns true when new address is being added and it is valid', () => {
    const cart = {
      billing_address: {
        id: 10
      },
      shipping_address: {
        id: 10
      }
    }
    const checkout = {
      addressBook: [],
      billingAddress: {
        errors: {},
        line_1: 'Queen Street',
        zipcode: 'LS27EY',
        city: 'Leeds',
        primary_phone: '12312312312',
        email: 'test@example.com'
      }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    expect(wrapper.instance().nextStepAvailable()).toBe(true)
  })
})

describe('nextSection()', () => {
  test('navigates to the review step when shipping address is from the address book', async () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const cart = {
      billing_address: {
        id: 10
      }
    }
    const checkout = {
      addressBook: [{
        id: 10
      }]
    }
    const setCurrentStep = jest.fn()

    const wrapper = shallow(<CheckoutPaymentPage
      cart={cart}
      checkout={checkout}
      setCurrentStep={setCurrentStep}
    />, { disableLifecycleMethods: true })

    await wrapper.instance().nextSection()

    expect(pushSpy).toHaveBeenCalledWith('/checkout/payment', '/checkout/review')
    expect(wrapper.state().reviewStep).toBe(true)
    expect(setCurrentStep).toHaveBeenCalledWith(4)

    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })

  test('saves new address to address book and sets it on cart', async () => {
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
    const checkout = {
      billingAddress: {
        id: 20,
        saveToAddressBook: true
      }
    }
    const setCurrentStep = jest.fn()

    const wrapper = shallow(<CheckoutPaymentPage
      cart={cart}
      checkout={checkout}
      dispatch={dispatch}
      setCurrentStep={setCurrentStep}
    />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    await wrapper.instance().nextSection()

    expect(saveToAddressBookSpy).toHaveBeenCalledWith(checkout.billingAddress)
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
    const checkout = {
      billingAddress: {
        id: 20
      }
    }
    const setCurrentStep = jest.fn()

    const wrapper = shallow(<CheckoutPaymentPage
      cart={cart}
      checkout={checkout}
      dispatch={dispatch}
      setCurrentStep={setCurrentStep}
    />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    await wrapper.instance().nextSection()

    expect(createBillingAddressSpy).toHaveBeenCalledWith(checkout.billingAddress)
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
    const order = {
      card_errors: { key: 'value' }
    }
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns false when shipping address is missing', () => {
    const order = {}
    const cart = {
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns false when billing address is missing', () => {
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      shipping_method: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns false when shipping method is missing', () => {
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().isValidOrder(cart, order)).toBe(false)
  })

  test('returns true for valid orders', () => {
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().isValidOrder(cart, order)).toBe(true)
  })
})

describe('convertToOrder()', () => {
  test('requests card token when paying by card', () => {
    const requestCardTokenSpy = jest.spyOn(OrderActions, 'requestCardToken').mockImplementation(() => 'requestCardTokenAction')
    const dispatch = jest.fn()

    const wrapper = shallow(<CheckoutPaymentPage cart={{}} dispatch={dispatch} />, { disableLifecycleMethods: true })
    wrapper.setState({ selectedPaymentMethod: 'card' })

    wrapper.instance().convertToOrder()

    expect(requestCardTokenSpy).toHaveBeenCalledWith(true)
    expect(dispatch).toHaveBeenCalledWith('requestCardTokenAction')

    requestCardTokenSpy.mockRestore()
  })
})

describe('continueButtonProps()', () => {
  test('returns an enabled Place Order button props when at review step and order is valid', () => {
    const order = {}
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} order={order} />, { disableLifecycleMethods: true })
    wrapper.setState({ reviewStep: true })

    const continueButtonProps = wrapper.instance().continueButtonProps()
    expect(continueButtonProps.label).toEqual('Place Order')
    expect(continueButtonProps.disabled).toBe(false)
  })

  test('returns a disabled Place Order button props when at review step and order is invalid', () => {
    const order = { card_errors: { key: 'value' } }
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 },
      shipping_method: { id: 10 }
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} order={order} />, { disableLifecycleMethods: true })
    wrapper.setState({ reviewStep: true })

    const continueButtonProps = wrapper.instance().continueButtonProps()
    expect(continueButtonProps.label).toEqual('Place Order')
    expect(continueButtonProps.disabled).toBe(true)
  })

  test('returns a Review Your Order button props when at payment step', () => {
    const cart = {
      shipping_address: { id: 10 },
      billing_address: { id: 10 }
    }
    const checkout = {
      billingAddress: {}
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })

    const continueButtonProps = wrapper.instance().continueButtonProps()
    expect(continueButtonProps.label).toEqual('Review Your Order')
  })
})

describe('pageTitle()', () => {
  test('returns correct title for the payment step', () => {
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().pageTitle()).toEqual('Checkout - Payment')
  })

  test('returns correct title for the review step', () => {
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ reviewStep: true })

    expect(wrapper.instance().pageTitle()).toEqual('Checkout - Review')
  })
})

describe('currentStep()', () => {
  test('returns correct step for the payment step', () => {
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().currentStep()).toEqual(3)
  })

  test('returns correct step for the review step', () => {
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ reviewStep: true })

    expect(wrapper.instance().currentStep()).toEqual(4)
  })
})

describe('render()', () => {
  test('renders a loading indicator when loading data', () => {
    const wrapper = shallow(<CheckoutPaymentPage cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.find('Loading').length).toEqual(1)
    expect(wrapper.find('AddressFormSummary').length).toEqual(0)
    expect(wrapper.find('ShippingMethodsSummary').length).toEqual(0)
    expect(wrapper.find('PaymentMethod').length).toEqual(0)
    expect(wrapper.find('PaymentMethodSummary').length).toEqual(0)
  })

  test('renders correct checkout components', () => {
    const cart = {
      shipping_address: {}
    }
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ loading: false })

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('AddressFormSummary').length).toEqual(1)
    expect(wrapper.find('ShippingMethodsSummary').length).toEqual(1)
    expect(wrapper.find('PaymentMethod').length).toEqual(1)
    expect(wrapper.find('PaymentMethodSummary').length).toEqual(1)
  })

  test('displays payment method selection when at payment step', () => {
    const cart = {
      shipping_address: {}
    }
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ loading: false })

    expect(wrapper.find('PaymentMethod').parent().props().className).toEqual('')
    expect(wrapper.find('PaymentMethodSummary').parent().props().className).toEqual('u-hidden')
  })

  test('displays payment method summary when at payment step', () => {
    const cart = {
      shipping_address: {}
    }
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<CheckoutPaymentPage cart={cart} checkout={checkout} order={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({
      loading: false,
      reviewStep: true
    })

    expect(wrapper.find('PaymentMethod').parent().props().className).toEqual('u-hidden')
    expect(wrapper.find('PaymentMethodSummary').parent().props().className).toEqual('')
  })
})
