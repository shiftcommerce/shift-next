// Libraries
import Router from 'next/router'
import nock from 'nock'
import Cookies from 'js-cookie'

// Pages
import ShippingMethodPage from '../../src/pages/checkout/shipping-method'
import * as apiActions from '../../src/actions/api-actions'

// Lib
import Config from '../../src/lib/config'

const shippingAddress = {
  country_code: 'GB',
  first_name: 'First Name',
  last_name: 'Last Name',
  line_1: 'Test House',
  zipcode: 'TEST POSTCODE',
  city: 'Leeds',
  state: 'Yorkshire',
  primary_phone: '01234567890',
  email: 'test@example.com',
  collapsed: false,
  completed: false,
  showEditButton: true,
  errors: {}
}

afterEach(() => { nock.cleanAll() })

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

test('sets paymentMethod in state when instantiated', () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  const cartState = {
    shipping_address: { id: 99 }
  }
  const checkoutState = {}
  const thirdPartyPaymentMethodOptions = ['PayPal']
  const setCurrentStep = jest.fn()

  // Act
  const wrapper = shallow(
    <ShippingMethodPage cart={cartState} checkout={checkoutState} setCurrentStep={setCurrentStep} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>,
    { disableLifecycleMethods: true }
  )

  // Assert
  expect(wrapper.instance().state.paymentMethod).toBe('PayPal')
  cookieSpy.mockRestore()
  pushSpy.mockRestore()
})

test('componentDidMount() redirects to the shipping address page when one is not set when the default card payment option is used', () => {
  // Arrange
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  const cartState = {}
  const checkoutState = {}
  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  shallow(<ShippingMethodPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>)

  // Assert
  expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-address')
  pushSpy.mockRestore()
})

test('componentDidMount() redirects to the payment method page when shipping address is not set when third party payment is used', () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  const cartState = {
    shipping_address: { id: 99 }
  }
  const checkoutState = {}
  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  shallow(
    <ShippingMethodPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>
  )

  // Assert
  expect(pushSpy).toHaveBeenCalledWith('/checkout/payment-method')
  cookieSpy.mockRestore()
  pushSpy.mockRestore()
})

test('componentDidMount() redirects to the payment method page when billing address is not set when third party payment is used', () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  const cartState = {}
  const checkoutState = {}
  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  shallow(
    <ShippingMethodPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>
  )

  // Assert
  expect(pushSpy).toHaveBeenCalledWith('/checkout/payment-method')
  cookieSpy.mockRestore()
  pushSpy.mockRestore()
})

test('renders correct checkout components', () => {
  // Arrange
  const thirdPartyPaymentMethodOptions = ['PayPal']
  const checkoutState = {
    shippingAddress: {
      collapsed: true,
      completed: true,
      showEditButton: true
    },
    paymentMethod: 'PayPal'
  }

  // Act
  const wrapper = shallow(<ShippingMethodPage cart={{ shipping_address: {} }} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />, {
    disableLifecycleMethods: true
  })

  // Assert
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('AddressFormSummary').length).toEqual(1)
  // ShippingMethods component doesn't render as there aren't any
  // shippingMethods returned from the API yet
  expect(wrapper.find('ShippingMethods').length).toEqual(0)
})

test('render shipping methods as expected', async () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'Credit/Debit Card')

  const cart = {
    line_items: [
      {
        id: '1'
      }
    ],
    line_items_count: 1,
    shipping_address: shippingAddress,
    shipping_method: {
      dummy: true
    }
  }

  const checkout = {
    shippingAddress: {
      collapsed: true,
      completed: true,
      showEditButton: true
    },
    shippingMethod: {}
  }

  const fetchShippingSpy = jest.spyOn(ShippingMethodPage, 'fetchShippingMethods').mockImplementation(() => Promise.resolve({
    data: [{
      id: 1,
      sku: 'STA_SHIP',
      label: 'Standard shipping',
      total: 3.75,
      meta_attributes: {
        working_days: {
          value: 2
        }
      }
    }]
  }))

  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} dispatch={jest.fn()} />)

  // Assert
  expect(wrapper.find('Loading')).toBeTruthy()
  expect(wrapper).toMatchSnapshot()

  await wrapper.instance().componentDidMount()

  expect(wrapper).toIncludeText('1 item')
  expect(wrapper).toIncludeText('Standard shipping')

  fetchShippingSpy.mockRestore()
  cookieSpy.mockRestore()
})

test('renders line item quantity as expected', async () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'Credit/Debit Card')
  const cart = {
    line_items: [],
    line_items_count: 0,
    shipping_address: shippingAddress,
    shipping_method: {
      id: 1,
      sku: 'STA_SHIP',
      label: 'Standard shipping',
      total: 3.75,
      meta_attributes: {
        working_days: {
          value: 2
        }
      }
    }
  }

  const checkout = {
    shippingAddress: {
      collapsed: true,
      completed: true,
      showEditButton: true
    },
    shippingMethod: {
      collapsed: false
    }
  }

  const fetchShippingSpy = jest.spyOn(ShippingMethodPage, 'fetchShippingMethods').mockImplementation(() => Promise.resolve({ data: [] }))

  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} />)

  // Assert
  expect(wrapper.find('Loading')).toBeTruthy()
  await wrapper.instance().componentDidMount()

  expect(wrapper).toMatchSnapshot()
  expect(wrapper).toIncludeText('0 items')

  fetchShippingSpy.mockRestore()
})

test('preselects first shipping method when fetching shipping methods and none is set', async () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'Credit/Debit Card')
  const cart = {
    line_items: [],
    line_items_count: 0,
    shipping_address: shippingAddress
  }

  const checkout = {
    shippingAddress: {
      collapsed: true,
      completed: true,
      showEditButton: true
    },
    shippingMethod: {
      collapsed: false
    }
  }
  const fetchShippingSpy = jest.spyOn(ShippingMethodPage, 'fetchShippingMethods').mockImplementation(() => Promise.resolve({
    data: [{
      id: 1,
      sku: 'STA_SHIP',
      label: 'Standard shipping',
      total: 3.75,
      meta_attributes: {
        working_days: {
          value: 2
        }
      }
    }, {
      id: 2,
      sku: 'NEX_SHIP',
      label: 'Next day delivery',
      total: 6.25,
      meta_attributes: {
        working_days: {
          value: 1
        }
      }
    }]
  }))

  const postSpy = jest.spyOn(apiActions, 'postEndpoint').mockImplementation(() => { cart.shipping_method = { id: 1 } })

  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} dispatch={jest.fn()} />)

  // Assert
  expect(wrapper.find('Loading')).toBeTruthy()

  await wrapper.instance().componentDidMount()

  const request = postSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/setShippingMethod')
  expect(request.body.shippingMethodId).toEqual(1)

  postSpy.mockRestore()
  fetchShippingSpy.mockRestore()
  cookieSpy.mockRestore()
})

test('selecting a shipping method makes a correct API call', async () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'Credit/Debit Card')
  const cart = {
    line_items: [],
    line_items_count: 1,
    shipping_address: shippingAddress,
    shipping_method: {
      id: 1,
      sku: 'STA_SHIP',
      label: 'Standard shipping',
      total: 3.75,
      meta_attributes: {
        working_days: {
          value: 2
        }
      }
    }
  }

  const checkout = {
    shippingAddress: {
      collapsed: true,
      completed: true,
      showEditButton: true
    },
    shippingMethod: {
      collapsed: false
    }
  }

  const fetchShippingSpy = jest.spyOn(ShippingMethodPage, 'fetchShippingMethods').mockImplementation(() => Promise.resolve({
    data: [{
      id: 1,
      sku: 'STA_SHIP',
      label: 'Standard shipping',
      total: 3.75,
      meta_attributes: {
        working_days: {
          value: 2
        }
      }
    }, {
      id: 2,
      sku: 'NEX_SHIP',
      label: 'Next day delivery',
      total: 6.25,
      meta_attributes: {
        working_days: {
          value: 1
        }
      }
    }]
  }))

  const postSpy = jest.spyOn(apiActions, 'postEndpoint').mockImplementation(() => { cart.shipping_method = { id: 1 } })

  const thirdPartyPaymentMethodOptions = ['PayPal']

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions} dispatch={jest.fn()} />)

  // Assert
  expect(wrapper.find('Loading')).toBeTruthy()

  await wrapper.instance().componentDidMount()
  wrapper.update()

  wrapper.find('input[id="NEX_SHIP_2"]').simulate('change', { target: { checked: true } })

  const request = postSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/setShippingMethod')
  expect(request.body.shippingMethodId).toEqual(2)

  fetchShippingSpy.mockRestore()
  postSpy.mockRestore()
  cookieSpy.mockRestore()
})

test('fetchShippingMethods() returns shipping methods from the API', async () => {
  Config.set({
    apiHostProxy: 'http://example.com'
  })

  nock('http://example.com')
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/getShippingMethods')
    .reply(200, { data: 'shipping methods data' })

  expect(await ShippingMethodPage.fetchShippingMethods()).toEqual({ data: 'shipping methods data' })
})

test('fetches shipping methods, sorts them by total and puts them in state', async () => {
  // Arrange
  const cookieSpy = jest.spyOn(Cookies, 'get').mockImplementation(() => 'PayPal')
  const shippingMethods = {
    data: [{
      id: 1,
      total: 20,
      meta_attributes: {
        working_days: {
          value: 1
        }
      }
    }, {
      id: 2,
      total: 10,
      meta_attributes: {
        working_days: {
          value: 1
        }
      }
    }]
  }

  const cartState = {
    shipping_address: shippingAddress,
    billing_address: { id: 2 },
    shipping_method: {}
  }

  const checkoutState  = {
    shippingAddress: {
      collapsed: true,
      completed: true,
      showEditButton: true
    },
    shippingMethod: {
      collapsed: false
    }
  }
  const thirdPartyPaymentMethodOptions = ['PayPal']
  const instance = mount(
    <ShippingMethodPage cart={cartState} checkout={checkoutState} thirdPartyPaymentMethods={thirdPartyPaymentMethodOptions}/>
  ).instance()
  const fetchShippingMethodsSpy = jest.spyOn(instance.constructor, 'fetchShippingMethods').mockImplementation(() => shippingMethods)

  // Act
  await instance.componentDidMount()

  // Assert
  expect(instance.state.loading).toEqual(false)
  expect(instance.state.shippingMethods).toEqual(shippingMethods.data)
  expect(instance.state.paymentMethod).toEqual('PayPal')
  fetchShippingMethodsSpy.mockRestore()
  cookieSpy.mockRestore()
})
