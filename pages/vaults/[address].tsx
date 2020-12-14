import React, { Fragment } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client'
import VaultSeriesList from 'components/VaultSeriesList';
import TransactionList, { VAULT_TX_QUERY, NUM_ROWS, MAX_TIMESTAMP } from 'components/TransactionList';
import { initializeApollo } from 'lib/apolloClient';
import backArrow from 'assets/back.svg';

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 40px 0;
  align-items: center;
`;

const BackButton = styled.a`
  display: flex;
  color: #ffffff;
  font-weight: bold;
  font-size: 12px;
  text-decoration: none;
  align-items: center;

  &:before {
    content: '';
    display: block;
    height: 36px;
    width: 36px;
    margin-right: 16px;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.16);
    background-image: url('${backArrow}');
    background-repeat: no-repeat;
    background-position: center;
  }

  &:hover:before {
    background-color: rgba(255, 255, 255, 0.25);
  }
`;

const EtherscanLink = styled.a`
  font-weight: bold;
  font-size: 14px;
  color: #ffffff;
`;

const Title = styled.h1`
  font-weight: 600;
  font-size: 24px;
`;


const VaultStatBar = styled.dl`
  display: flex;
  height: 44px;
`;

const VaultStat = styled.div``;

const Heading = styled.h2`
  font-family: Syne;
  font-weight: bold;
  font-size: 24px;
  color: #ffffff;
`;

const Def = styled.dt`
  font-weight: bold;
  font-size: 14px;
  color: #979797;
`;

const Val = styled.dd`
  font-weight: bold;
  font-size: 19px;
  margin: 0;
`;

export const VAULT_QUERY = gql`
  query getVault($address: String!) {
    vault(id: $address) {
      id
      collateralETH
      collateralChai
      fyDais {
        fyDai {
          maturity
          apr
          symbol
        }
        totalFYDaiDebt
      }
    }
  }
`;

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 3 };

const VaultDetails: React.FC<{ address: string }> = ({ address }) => {
  const { error, data } = useQuery(VAULT_QUERY, { variables: { address } });

  if (error) {
    return <pre>{error}</pre>
  }

  return (
    <div>
      <Head>
        <title>Account {address} - Yield</title>
      </Head>

      <Toolbar>
        <Link href="/vaults" passHref>
          <BackButton>Back to accounts</BackButton>
        </Link>

        <EtherscanLink href={`https://etherscan.io/address/${address}`}>View on Etherscan</EtherscanLink>
      </Toolbar>

      <Title>{address}</Title>

      {data.vault && (
        <Fragment>
          <VaultStatBar>
            {data.vault.collateralETH !== '0' && (
              <VaultStat>
                <Def>ETH Collateral</Def>
                <Val>{parseFloat(data.vault.collateralETH).toLocaleString(undefined, localeOptions)}</Val>
              </VaultStat>
            )}
            {data.vault.collateralChai !== '0' && (
              <VaultStat>
                <Def>Chai Collateral</Def>
                <Val>{parseFloat(data.vault.collateralChai).toLocaleString(undefined, localeOptions)}</Val>
              </VaultStat>
            )}
          </VaultStatBar>

          <VaultSeriesList data={data.vault.fyDais} />
        </Fragment>
      )}

      <Heading>Transactions</Heading>
      <TransactionList vault={address} />
    </div>
  );
};

export default VaultDetails;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: VAULT_QUERY,
    variables: { address: query.address },
  });
  await apolloClient.query({
    query: VAULT_TX_QUERY,
    variables: {
      vault: query.address,
      limit: NUM_ROWS,
      before: MAX_TIMESTAMP,
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      address: query.address,
    },
  };
};
