// Libraries
import React, { Component } from 'react'
import Router from 'next/router'
import t from 'typy'
import qs from 'qs'

// Lib
import ApiClient from '../lib/api-client'

const slugRequest = (slug) => {
  const queryObject = {
    filter: {
      path: slug
    },
    page: {
      number: 1,
      size: 1
    },
    fields: {
      slugs: 'resource_type,resource_id,active,slug'
    }
  }
  const query = qs.stringify(queryObject)
  return {
    endpoint: `/getSlug/?${query}`
  }
}

class Slug extends Component {
  static async getInitialProps ({ query }) {
    const request = slugRequest(query.slug)
    const response = await new ApiClient().read(request.endpoint, request.query)

    const resourceType = t(response, 'data.resource_type').safeObject
    const resourceId = t(response, 'data.resource_id').safeObject
    let url = query.slug

    if (url === '/homepage') {
      url = '/'
    }

    Router.push(`/${resourceType.toLowerCase()}?id=${resourceId}`, url)
    return {}
  }
}

export default Slug
