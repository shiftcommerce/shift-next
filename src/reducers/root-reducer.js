// Libraries
import { combineReducers } from 'redux'

// Reducers
import setAccount from './set-account'
import setCart from './set-cart'
import setCheckout from './set-checkout'
import setLogin from './set-login'
import setMenu from './set-menu'
import setOrder from './set-order'
import setOrders from './set-orders'
import setProduct from './set-product'
import setRegistration from './set-registration'
import setSearchState from './set-search-state'
import globalReducer from './global-reducer'

const rootReducer = combineReducers({
  account: setAccount,
  cart: setCart,
  checkout: setCheckout,
  global: globalReducer,
  login: setLogin,
  menu: setMenu,
  order: setOrder,
  orders: setOrders,
  product: setProduct,
  registration: setRegistration,
  search: setSearchState
})

export default rootReducer
