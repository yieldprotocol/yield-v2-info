import Head from 'next/head'
import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client'
import { useApollo } from 'lib/apolloClient'
import styled, { createGlobalStyle } from 'styled-components'
import Header from 'components/Header'

const GlobalStyle = createGlobalStyle`
  body {
    background: #141318;
    color: #FFFFFF;
    margin: 0;
    font-family: 'Roboto', sans-serif;
  }

  #__next {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 4px;
  }
`

const Container = styled.div`
  max-width: 984px;
  width: 100%;
`

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps.initialApolloState)

  return (
    <ApolloProvider client={apolloClient}>
      <GlobalStyle />
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Syne:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <Container>
        <Header />
        <Component {...pageProps} />
      </Container>
    </ApolloProvider>
  )
};

export default App;
