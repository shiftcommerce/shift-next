// Libraries
import t from 'typy'

// Returns a copy of the searchState to be used for building the new page URL.
// Removes any elements which shouldn't make it into the URL, i.e.
// * the id of the current resource
// * the id of the current category
// * current page number of pagination
// * reset refinements
// * reset ranges
export default function buildSearchStateForURL (searchState) {
  // Get a deep copy of searchState - we don't want to modify it
  const searchStateClone = JSON.parse(JSON.stringify(searchState))
  // Remove the resource id from the URL
  delete searchStateClone.id
  // Remove the category id filter from the URL
  delete searchStateClone.configure
  // Remove the page number from the URL
  delete searchStateClone.page

  deleteResetProductRating(searchStateClone)

  deleteEmptyRanges(searchStateClone)

  deleteEmptyRefinements(searchStateClone)

  return searchStateClone
}

function deleteResetProductRating (searchStateClone) {
  if (!searchStateClone.range) return

  const productRating = t(searchStateClone, 'range.product_rating').safeObject
  if (productRating && productRating.min === 0 && productRating.max === 5) {
    delete searchStateClone.range.product_rating
  }

  return searchStateClone
}

function deleteEmptyRanges (searchStateClone) {
  if (!searchStateClone.range) return

  const range = searchStateClone.range
  Object.keys(range).forEach(rangeEntry => {
    if (!Object.keys(range[rangeEntry]).length) delete range[rangeEntry]
  })

  if (!Object.keys(range).length) delete searchStateClone.range

  return searchStateClone
}

function deleteEmptyRefinements (searchStateClone) {
  if (!searchStateClone.refinementList) return

  const refinementList = searchStateClone.refinementList
  Object.keys(refinementList).forEach(refinement => {
    if (!refinementList[refinement]) delete refinementList[refinement]
  })

  if (!Object.keys(refinementList).length) delete searchStateClone.refinementList

  return searchStateClone
}
