import React, { Children } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import Link, { LinkProps } from 'next/link'

const ActiveLink: React.FC<LinkProps> = ({ children, ...props }) => {
  const { asPath } = useRouter()
  const child = Children.only(children)

  // pages/index.js will be matched via props.href
  // pages/about.js will be matched via props.href
  // pages/[slug].js will be matched via props.as

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        active: asPath === props.href || asPath === props.as,
      })}
    </Link>
  )
}

export default ActiveLink
