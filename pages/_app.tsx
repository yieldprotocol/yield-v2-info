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
        <meta property="og:title" content="Yield Info" />
        <meta property="og:description" content="Borrowing & lending statistics for the Yield Protocol" />
        <meta property="fb:app_id" content="608466123308002" />
        <meta property="og:image:width" content="1920" />
        <meta property="og:image:height" content="1080" />
        <meta property="og:image" content="https://info.yield.is/social-info.png" />

        <meta name="twitter:title" content="Yield Info" />
        <meta name="twitter:description" content="Borrowing & lending statistics for the Yield Protocol" />
        <meta name="twitter:image" content="https://info.yield.is/social-info.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yield" />

        <link rel="icon" href="https://yield-web.netlify.app/favicons/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="https://yield-web.netlify.app/favicons/favicon-16x16.png" sizes="16x16" type="image/png" />

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
