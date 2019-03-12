// Actions
import * as types from '../actions/action-types'
import { readEndpoint } from './api-actions'

const menuRequest = {
  endpoint: '/getMenus',
  query: {
    fields: {
      menu_items: 'title,slug,menu_items,item,background_image_link,background_image,published,canonical_path,meta_attributes',
      menus: 'title,reference,updated_at,menu_items'
    },
    filter: {
      filter: {
        reference: {
          eq: 'mega-menu'
        }
      }
    },
    include: 'menu_items'
  },
  requestActionType: types.GET_MENU,
  successActionType: types.SET_MENU,
  errorActionType: types.ERROR_MENU
}

export function readMenu (store) {
  return readEndpoint(menuRequest)
}
