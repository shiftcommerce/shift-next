import React from 'react'
import Head from 'next/head'

export default (props) => {
  const { children } = props
  return (
    <Head>
      {children}
    </Head>
  )
}
