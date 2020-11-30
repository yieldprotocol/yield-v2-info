import React, { Children, ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'

const ActiveLink: React.FC<LinkProps & { exact?: boolean }> = ({ children, exact, ...props }) => {
  const { asPath } = useRouter()
  const child = Children.only(children) as ReactElement;

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        active: exact ? asPath === props.href : asPath.indexOf(props.href.toString()) === 0,
      })}
    </Link>
  )
}

export default ActiveLink
