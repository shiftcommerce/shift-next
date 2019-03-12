// Pages
import CartPage from '../../src/pages/cart'

// Actions
import { updateLineItemQuantity } from '../../src/actions/cart-actions'

// Fixtures
import cart from '../fixtures/cart'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

const RealDate = Date
const mockDate = new Date('2019-01-01')

beforeAll(() => {
  global.Date = class extends Date {
    constructor () {
      super()
      return mockDate
    }
  }
})

afterAll(() => {
  global.Date = RealDate
})

test('dispatch updateQuantity action on changing line item quantity', () => {
  // Arrange

  const expectedFunction = updateLineItemQuantity().toString()
  const updateQuantitySpy = jest.spyOn(CartPage.prototype, 'updateQuantity')
  const dispatch = jest.fn().mockImplementation((updateSpy) => 'first call')

  // Act
  const wrapper = mount(
    <CartPage cart={cart} dispatch={dispatch} />
  )

  // Assert
  expect(wrapper).toMatchSnapshot()

  // Verify if cart line items are available
  expect(wrapper).toIncludeText('2 items in your shopping basket')

  // To clear the logs of dispatch being called on component mount
  dispatch.mockClear()

  // Trigger quantity change
  wrapper.find('select').first().simulate('change', { target: { value: 3, dataset: { variant: '123' } } })

  // Verify if updateQuantity method is getting triggered on quantity update
  expect(updateQuantitySpy).toHaveBeenCalled()

  expect(dispatch).toHaveBeenCalled()

  // Verify it dispatch method called a function
  expect(dispatch.mock.calls[0][0]).toEqual(expect.any(Function))

  // Verify if the dispatch function has dispatched updateQuantity action.
  expect(dispatch.mock.calls[0][0].toString()).toMatch(expectedFunction)
})
