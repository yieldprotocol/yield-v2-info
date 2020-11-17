import React from 'react';
import styled from 'styled-components';
import MaturityList from 'components/MaturityList';

const HeadingBar = styled.div`
  display: flex;
`;

const Heading = styled.h2`
  font-family: Syne;
  font-weight: bold;
  font-size: 32px;
`;

const SeriesPage = () => {
  return (
    <div>
      <HeadingBar>
        <Heading>Series</Heading>
      </HeadingBar>

      <MaturityList />
    </div>
  )
};

export default SeriesPage;
