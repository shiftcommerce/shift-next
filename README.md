[ ![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

# Shift Next
## Purpose

This Library can be used to build a SHIFT-powered ecommerce front-end site with Next.js. It provides a collection of pages and backend endpoints. Pages are set up with algolia and redux and can be customised to fit different front-end designs. The backend endpoints go to the SHIFT-platform.


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