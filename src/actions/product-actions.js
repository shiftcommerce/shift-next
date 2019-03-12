// Actions
import { readEndpoint } from './api-actions'
import * as types from './action-types'

const productRequest = (productId) => {
  return {
    endpoint: `/getProduct/${productId}`,
    query: {
      include: 'asset_files,variants,bundles,bundles.asset_files,template,meta.*',
      fields: { asset_files: 'image_height,image_width,s3_url' }
    },
    requestActionType: types.GET_PRODUCT,
    successActionType: types.SET_PRODUCT
  }
}

export function readProduct (productId) {
  return readEndpoint(productRequest(productId))
}
