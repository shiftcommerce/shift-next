// Libraries
import Router from 'next/router'
import nock from 'nock'

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
  errors: {}
}

afterEach(() => { nock.cleanAll() })

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

test('componentDidMount() redirects to the shipping address page when one is not set', () => {
  const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})
  shallow(<ShippingMethodPage cart={{}} />)
  expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-address')
  pushSpy.mockRestore()
})

test('renders correct checkout components', () => {
  const wrapper = shallow(<ShippingMethodPage cart={{ shipping_address: {} }} />, {
    disableLifecycleMethods: true
  })

  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('AddressFormSummary').length).toEqual(1)
  // ShippingMethods component doesn't render as there aren't any
  // shippingMethods returned from the API yet
  expect(wrapper.find('ShippingMethods').length).toEqual(0)
})

test('render shipping methods as expected', async () => {
  // Arrange
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
      completed: true
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

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} dispatch={jest.fn()} />)

  // Assert
  expect(wrapper.find('p').last()).toIncludeText('Loading...')
  expect(wrapper).toMatchSnapshot()

  await wrapper.instance().componentDidMount()

  expect(wrapper).toIncludeText('1 item')
  expect(wrapper).toIncludeText('Standard shipping')

  fetchShippingSpy.mockRestore()
})

test('renders line item quantity as expected', async () => {
  // Arrange
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
      completed: true
    },
    shippingMethod: {
      collapsed: false
    }
  }

  const fetchShippingSpy = jest.spyOn(ShippingMethodPage, 'fetchShippingMethods').mockImplementation(() => Promise.resolve({ data: [] }))

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} />)

  // Assert
  expect(wrapper.find('p').last()).toIncludeText('Loading...')

  await wrapper.instance().componentDidMount()

  expect(wrapper).toMatchSnapshot()
  expect(wrapper).toIncludeText('0 items')

  fetchShippingSpy.mockRestore()
})

test('preselects first shipping method when fetching shipping methods and none is set', async () => {
  // Arrange
  const cart = {
    line_items: [],
    line_items_count: 0,
    shipping_address: shippingAddress
  }

  const checkout = {
    shippingAddress: {
      collapsed: true,
      completed: true
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

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} dispatch={jest.fn()} />)

  // Assert
  expect(wrapper.find('p').last()).toIncludeText('Loading...')

  await wrapper.instance().componentDidMount()

  const request = postSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/setShippingMethod')
  expect(request.body.shippingMethodId).toEqual(1)

  postSpy.mockRestore()
  fetchShippingSpy.mockRestore()
})

test('selecting a shipping method makes a correct API call', async () => {
  // Arrange
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
      completed: true
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

  // Act
  const wrapper = mount(<ShippingMethodPage cart={cart} checkout={checkout} dispatch={jest.fn()} />)

  // Assert
  expect(wrapper.find('p').last()).toIncludeText('Loading...')

  await wrapper.instance().componentDidMount()
  wrapper.update()

  wrapper.find('input[id="NEX_SHIP_2"]').simulate('change', { target: { checked: true } })

  const request = postSpy.mock.calls[0][0]
  expect(request.endpoint).toEqual('/setShippingMethod')
  expect(request.body.shippingMethodId).toEqual(2)

  fetchShippingSpy.mockRestore()
  postSpy.mockRestore()
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

  const cart = {
    shipping_address: shippingAddress,
    shipping_method: {}
  }

  const instance = shallow(<ShippingMethodPage cart={cart} />).instance()

  const fetchShippingMethodsSpy = jest.spyOn(instance.constructor, 'fetchShippingMethods').mockImplementation(() => shippingMethods)

  await instance.componentDidMount()

  expect(instance.state).toEqual({
    loading: false,
    shippingMethods: shippingMethods.data
  })

  fetchShippingMethodsSpy.mockRestore()
})
