import React from 'react'
import styled from 'styled-components'
import logo from 'assets/logo.svg'
import ActiveLink from './ActiveLink'

const HeaderContaner = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 0;
  border-bottom: solid 1px #444444;
`

const HeaderLink = styled.a<{ active?: boolean }>`
  color: ${props => props.active ? '#ffffff' : '#848484'};
  font-family: 'Syne', sans-serif;
  margin: 0 8px;
  font-weight: 500;
  font-size: 16px;
`

const TryAppBtn = styled.a`
  display: flex;
  width: 137px;
  height: 36px;
  background: #5641FF;
  border-radius: 8px;
  font-weight: bold;
  font-size: 17px;
  font-family: 'Syne', sans-serif;
  color: #FFFFFF;
  align-items: center;
  justify-content: center;
  text-decoration: none;
`

const Header: React.FC = () => {
  return (
    <HeaderContaner>
      <div>
        <img src={logo} />
      </div>

      <div>
        <ActiveLink href="/" passHref>
          <HeaderLink>Overview</HeaderLink>
        </ActiveLink>
        <ActiveLink href="/series" passHref>
          <HeaderLink>Series</HeaderLink>
        </ActiveLink>
        <ActiveLink href="/accounts" passHref>
          <HeaderLink>Accounts</HeaderLink>
        </ActiveLink>
      </div>

      <TryAppBtn href="https://app.yield.is/">Try App</TryAppBtn>
    </HeaderContaner>
  )
}

export default Header
