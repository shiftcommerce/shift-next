// Libraries
import React, { Fragment } from 'react'

// Components
import { buildTemplateComponentsManifest } from '@shiftcommerce/shift-react-components'

export default function renderComponents (componentsData) {
  let components = []
  const templateComponentsManifest = buildTemplateComponentsManifest()

  for (let index = 0; index < componentsData.length; index++) {
    let component = componentsData[index]
    let ComponentName = templateComponentsManifest[component.reference]
    if (ComponentName) {
      components.push(
        <ComponentName
          key={index}
          componentData={component}
        />
      )
    }
  }

  return (
    <Fragment>
      { components }
    </Fragment>
  )
}
