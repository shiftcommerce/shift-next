[ ![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

# Shift Next
## Purpose

This repo holds everything related to next js, this is meant to be used with the reference site. Pages are set up with algolia and redux. This repo also holds all express route handlers for calls made by shift-node-api to the shift platform. All you need to do is change some .env variables to work with the shift platform and you will have a working front-end.


## Getting started

To add this package to your project you can carry out the instructions below.

#### Install:

```bash
yarn add @shiftcommerce/shift-next
npm i @shiftcommerce/shift-next
```

### Use within your project:
To make sure everything works correctly you need to pass these .env variables to shift next's config.

in your project

```jsx
import { shiftNextConfig } from '@shiftcommerce/shift-next'

// example
shiftNextConfig.set({
  algoliaApiKey: ALGOLIA_API_KEY,
  algoliaAppId: ALGOLIA_APP_ID,
  algoliaIndexName: ALGOLIA_INDEX_NAME,
  algoliaResultsPerPage: ALGOLIA_RESULTS_PER_PAGE,
  apiHostProxy: API_HOST_PROXY,
  storeName: 'ShopGo'
})
```

### Style Guide

in progress...