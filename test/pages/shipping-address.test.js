// Libraries
import Cookies from 'js-cookie'
import Router from 'next/router'

// Pages
import ShippingAddressPage from '../../src/pages/shipping-address'

// Components
import { AddressFormHeader, Button, CheckoutAddressForm } from '@shiftcommerce/shift-react-components'

// Actions
import * as AddressBookActions from '../../src/actions/address-book-actions'
import * as CartActions from '../../src/actions/cart-actions'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

describe('componentDidMount()', () => {
  test('sets loading to false in state when user is not logged in', () => {
    const wrapper = shallow(<ShippingAddressPage cart={{}} checkout={{}} />)

    wrapper.instance().componentDidMount()

    expect(wrapper.instance().state.loading).toBe(false)
  })

  describe('when user is logged in', () => {
    test("fetches the address book and preselects the preferred shipping address when cart doesn't have a shipping address", async () => {
      const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
      const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook').mockImplementation(() => 'fetchAddressBookAction')
      const setCartShippingAddressSpy = jest.spyOn(CartActions, 'setCartShippingAddress').mockImplementation(() => 'setCartShippingAddressAction')
      const dispatch = jest.fn().mockImplementation(value => Promise.resolve(value))
      const checkout = {
        addressBook: [{
          id: 1
        }, {
          id: 2,
          preferred_shipping: true
        }],
        paymentMethod: 'PayPal'
      }
      const thirdPartyPaymentMethods = ['PayPal']

      const wrapper = shallow(<ShippingAddressPage cart={{}} dispatch={dispatch} checkout={checkout} thirdPartyPaymentMethods={thirdPartyPaymentMethods} />)

      await wrapper.instance().componentDidMount()

      expect(dispatch).toHaveBeenCalledWith('fetchAddressBookAction')
      expect(setCartShippingAddressSpy).toHaveBeenCalledWith(2)
      expect(dispatch).toHaveBeenCalledWith('setCartShippingAddressAction')
      expect(wrapper.instance().state.loading).toBe(false)

      cookieSpy.mockRestore()
      fetchAddressBookSpy.mockRestore()
      setCartShippingAddressSpy.mockRestore()
    })

    test("fetches the address book and preselects the first shipping address when cart doesn't have a shipping address and there isn't a preferred one", async () => {
      const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
      const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook').mockImplementation(() => 'fetchAddressBookAction')
      const setCartShippingAddressSpy = jest.spyOn(CartActions, 'setCartShippingAddress').mockImplementation(() => 'setCartShippingAddressAction')
      const dispatch = jest.fn().mockImplementation(value => Promise.resolve(value))
      const checkout = {
        addressBook: [{
          id: 1
        }, {
          id: 2
        }]
      }

      const wrapper = shallow(<ShippingAddressPage cart={{}} dispatch={dispatch} checkout={checkout} />)

      await wrapper.instance().componentDidMount()

      expect(dispatch).toHaveBeenCalledWith('fetchAddressBookAction')
      expect(setCartShippingAddressSpy).toHaveBeenCalledWith(1)
      expect(dispatch).toHaveBeenCalledWith('setCartShippingAddressAction')
      expect(wrapper.instance().state.loading).toBe(false)

      cookieSpy.mockRestore()
      fetchAddressBookSpy.mockRestore()
      setCartShippingAddressSpy.mockRestore()
    })

    test('fetches the address book and sets loading to false when cart has a shipping address', async () => {
      // Arrange
      const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
      const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook').mockImplementation(() => 'fetchAddressBookAction')
      const dispatch = jest.fn().mockImplementation(value => Promise.resolve(value))
      const cart = { shipping_address: {} }
      const checkoutState = {paymentMethod: 'Credit/Debit Card'}
      const thirdPartyPaymentMethodOptions = ['PayPal']

      // Act
      const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} dispatch={dispatch} />)
      await wrapper.instance().componentDidMount()

      // Assert
      expect(dispatch).toHaveBeenCalledWith('fetchAddressBookAction')
      expect(wrapper.instance().state.loading).toBe(false)

      cookieSpy.mockRestore()
      fetchAddressBookSpy.mockRestore()
    })
  })
})

describe('nextSection()', () => {
  test('navigates to shipping method selection when shipping address is from the address book', async () => {
    // Arrange
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const cart = {
      shipping_address: {
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
    const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}  />, { disableLifecycleMethods: true })
    await wrapper.instance().nextSection()

    // Assert
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-method')

    cookieSpy.mockRestore()
    pushSpy.mockRestore()
  })

  test('saves new address to address book and sets it on cart', async () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const saveToAddressBookSpy = jest.spyOn(AddressBookActions, 'saveToAddressBook').mockImplementation(() => 'saveToAddressBookAction')
    const setCartShippingAddressSpy = jest.spyOn(CartActions, 'setCartShippingAddress').mockImplementation(() => 'setCartShippingAddressAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cart = {
      shipping_address: {
        id: 20
      }
    }
    const checkout = {
      shippingAddress: {
        id: 20,
        saveToAddressBook: true
      }
    }

    const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkout} dispatch={dispatch} />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    await wrapper.instance().nextSection()

    expect(saveToAddressBookSpy).toHaveBeenCalledWith(checkout.shippingAddress)
    expect(setCartShippingAddressSpy).toHaveBeenCalledWith(20)
    expect(dispatch).toHaveBeenCalledWith('saveToAddressBookAction')
    expect(dispatch).toHaveBeenCalledWith('setCartShippingAddressAction')
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-method')

    cookieSpy.mockRestore()
    pushSpy.mockRestore()
    saveToAddressBookSpy.mockRestore()
    setCartShippingAddressSpy.mockRestore()
  })

  test('creates new addresses and sets them on cart', async () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
    const createShippingAddressSpy = jest.spyOn(CartActions, 'createShippingAddress').mockImplementation(() => 'createShippingAddressAction')
    const setCartShippingAddressSpy = jest.spyOn(CartActions, 'setCartShippingAddress').mockImplementation(() => 'setCartShippingAddressAction')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const cart = {
      shipping_address: {
        id: 20
      }
    }
    const checkout = {
      shippingAddress: {
        id: 20
      }
    }

    const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkout} dispatch={dispatch} />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    await wrapper.instance().nextSection()

    expect(createShippingAddressSpy).toHaveBeenCalledWith(checkout.shippingAddress)
    expect(setCartShippingAddressSpy).toHaveBeenCalledWith(20)
    expect(dispatch).toHaveBeenCalledWith('createShippingAddressAction')
    expect(dispatch).toHaveBeenCalledWith('setCartShippingAddressAction')
    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-method')

    cookieSpy.mockRestore()
    pushSpy.mockRestore()
    createShippingAddressSpy.mockRestore()
    setCartShippingAddressSpy.mockRestore()
  })
})

describe('addressFormDisplayed()', () => {
  test('returns true when addressBook is empty', () => {
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<ShippingAddressPage checkout={checkout} cart={{}} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })

  test('returns true when adding new address is set in state', () => {
    const checkout = {
      addressBook: [{ id: 1 }]
    }

    const wrapper = shallow(<ShippingAddressPage checkout={checkout} cart={{}} />, { disableLifecycleMethods: true })
    wrapper.setState({ addingNewAddress: true })

    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })

  test('returns true when address is not from the address book', () => {
    const checkout = {
      addressBook: [{ id: 1 }]
    }
    const cart = {
      shipping_address: {
        id: 2
      }
    }

    const wrapper = shallow(<ShippingAddressPage checkout={checkout} cart={cart} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().addressFormDisplayed()).toBe(true)
  })
})

describe('cartAddressFromBook()', () => {
  test('returns false when customer is not logged in', () => {
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<ShippingAddressPage cart={{}} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(false)
  })

  test("returns false when cart doesn't have a shipping address", () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkout = {
      addressBook: []
    }

    const wrapper = shallow(<ShippingAddressPage cart={{}} checkout={checkout} />, { disableLifecycleMethods: true })

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

    const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(false)

    cookieSpy.mockRestore()
  })

  test('returns true when shipping address is from the address book', () => {
    const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => true)
    const checkout = {
      addressBook: [{ id: 10 }]
    }
    const cart = {
      shipping_address: {
        id: 10
      }
    }

    const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkout} />, { disableLifecycleMethods: true })

    expect(wrapper.instance().cartAddressFromBook()).toBe(true)

    cookieSpy.mockRestore()
  })
})

test('renders address form components', () => {
  const checkout = {
    addressBook: [],
    shippingAddress: {
      errors: {}
    }
  }

  const cart = {
    line_items_count: 1
  }

  const wrapper = shallow(<ShippingAddressPage cart={cart} checkout={checkout} />, { disableLifecycleMethods: true })
  wrapper.setState({ loading: false })

  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find(AddressFormHeader).length).toEqual(1)
  expect(wrapper.find(Button).length).toEqual(1)
  expect(wrapper.find(CheckoutAddressForm).length).toEqual(1)
})
