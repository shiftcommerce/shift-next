// Libraries
import React from 'react'

// Components
import { TemplateComponentsManifest } from 'shift-react-components'

export default function renderComponents (componentsData) {
  let components = []

  for (let index = 0; index < componentsData.length; index++) {
    let component = componentsData[index]
    let ComponentName = TemplateComponentsManifest[component.reference]
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
    <>
      { components }
    </>
  )
}
