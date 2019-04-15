// Libraries
import React, { Fragment } from 'react'

// Lib
import Config from './config'

// Components
import { buildTemplateComponentsManifest } from '@shiftcommerce/shift-react-components'

/**
 * Get the relevant templates for the page components
 * @param  {Array}    pageComponents
 * @return {String} - HTML markup for the component
 */
export default function renderComponents (pageComponents) {
  // Merge any custom template components with the ones from shift-react-components
  const templateComponentsManifest = Object.assign({}, buildTemplateComponentsManifest(), Config.get().customTemplateComponents)

  // Loop through all of the page components from the platform
  const componentsToRender = pageComponents.map((pageComponent, pageComponentIndex) => {
    // Get the template from the manifest
    const ComponentName = templateComponentsManifest[pageComponent.reference]

    // If the template exists in the manifest, it should be rendered
    if (ComponentName) {
      return (
        <ComponentName
          key={pageComponentIndex}
          componentData={pageComponent}
        />
      )
    }
  })

  return (
    <Fragment>
      { componentsToRender }
    </Fragment>
  )
}
