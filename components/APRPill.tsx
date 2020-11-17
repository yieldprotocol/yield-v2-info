import React from 'react';
import styled from 'styled-components';

const DEFAULT_COLOR = '#82d4bb';

const colorsBySeries: { [key: string]: string } = {
  fyDai20Oct: '#82d4bb',
  fyDai20Dec: '#6ab6f1',
  fyDai21Mar: '#cb90c9',
  fyDai21Jun: '#aed175',
  fyDai21Sep: '#f0817f',
  fyDai21Dec: '#ffbf81',
};

const Pill = styled.span<{ background: string }>`
  width: 70px;
  height: 30px;

  background: ${props => props.background};
  border-radius: 24px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

interface APRPillProps {
  apr: number;
  series: string;
}

const APRPill: React.FC<APRPillProps> = ({ apr, series }) => {
  const background = colorsBySeries[series] || DEFAULT_COLOR;
  return (
    <Pill background={background}>{apr.toFixed(2)}%</Pill>
  );
};

export default APRPill;
