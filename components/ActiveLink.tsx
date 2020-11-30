import React, { Children, ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'

const ActiveLink: React.FC<LinkProps & { exact?: boolean }> = ({ children, exact, ...props }) => {
  const { asPath } = useRouter()
  const child = Children.only(children) as ReactElement;

  // pages/index.js will be matched via props.href
  // pages/about.js will be matched via props.href
  // pages/[slug].js will be matched via props.as

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        active: exact ? asPath === props.href : asPath.indexOf(props.href) === 0,
      })}
    </Link>
  )
}

export default ActiveLink
