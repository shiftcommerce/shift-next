// Libraries
import { Provider } from 'react-redux'
import { createMockStore } from 'redux-test-utils'

// Pages
import MyAccountPage from '../../src/pages/my-account'

// Actions
import { getCustomerOrders } from '../../src/actions/account-actions'

// Components
import { OrderLineItems, ShippingAddresses } from '@shiftcommerce/shift-react-components'

// Fixtures
import orders from '../fixtures/orders'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

describe('My Account page', () => {
  test('renders a default message if the customer has no orders', () => {
    // Act
    const wrapper = mount(
      <Provider store={createMockStore()}>
        <MyAccountPage orders={{ data: [], loading: false }} dispatch={jest.fn()} />
      </Provider>
    )

    // Assert
    expect(wrapper).toIncludeText('No previous orders found.')
  })

  test('renders a customers previous orders', () => {
    // Act
    const wrapper = mount(
      <Provider store={createMockStore()}>
        <MyAccountPage orders={orders} dispatch={jest.fn()} />
      </Provider>
    )

    // Assert
    expect(wrapper).toIncludeText(`Order Number: ${orders.data[0].reference}`)
    expect(wrapper).toIncludeText(`Order Number: ${orders.data[1].reference}`)

    expect(wrapper).toContainReact(<OrderLineItems items={orders.data[0].line_items} />)
    expect(wrapper).toContainReact(<OrderLineItems items={orders.data[1].line_items} />)

    expect(wrapper).toContainReact(<ShippingAddresses addresses={orders.data[0].shipping_addresses} />)
    expect(wrapper).toContainReact(<ShippingAddresses addresses={orders.data[1].shipping_addresses} />)
  })

  test('calls getCustomerOrders on componentDidMount', () => {
    const dispatch = jest.fn()
    const expectedFunction = getCustomerOrders().toString()

    const wrapper = shallow(<MyAccountPage dispatch={dispatch} orders={{ loading: true }} />, { disableLifecycleMethods: true })

    wrapper.instance().componentDidMount()

    expect(dispatch).toHaveBeenCalled()

    // Verify it dispatch method called a function
    expect(dispatch.mock.calls[0][0]).toEqual(expect.any(Function))

    // Verify if the dispatch function has dispatched getCustomerOrders action.
    expect(dispatch.mock.calls[0][0].toString()).toMatch(expectedFunction)
  })
})
