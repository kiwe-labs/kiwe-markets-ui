import React from 'react';
import { Layout, Row, Col } from 'antd';
import logo from '../assets/logo.png';
import styled from 'styled-components';

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  img {
    height: 60px;
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const { Footer } = Layout;
const homePageUrl = "https://zalina.finance";

export const CustomFooter = () => {

  return (
    <Footer
      style={{
        paddingBottom: 60,
        paddingTop: 36,
        marginTop: 50,
      }}
    >
      <Row align="top" justify="center" gutter={[16, 4]}>
        <Col flex="266px 0 0" style={{ marginRight: 104, textAlign:'center' }}>
          <LogoWrapper onClick={() => window.location.href = homePageUrl}>
            <img src={logo} alt="" /> Kiwe Markets
          </LogoWrapper>
          <p>Kiwe is a decentralized autonomous organization.</p>
        </Col>
        <Col style={{ marginRight: 80 }}>
          <h4>Support</h4>
          <a href="https://forms.gle/iNiPGWRhUEBxcjyQ6" target="_blank" rel="noopener noreferrer">Project Listing</a>
          <a href="https://docs.kiwe.markets/" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href="mailto:admin@kiwe.markets">Contact</a>
          <a href="https://discord.gg/HBefBzQcdy" target="_blank" rel="noopener noreferrer">Discord</a>
        </Col>
        <Col style={{ marginRight: 80 }}>
          <h4>KIWE Token</h4>
          <a href="https://docs.kiwe.markets/kiwe-token/token-details" target="_blank" rel="noopener noreferrer">Token details</a>
          <a href="https://solscan.io/token/8WftAet8HSHskSp8RUVwdPt6xr3CtF76UF5FPmazY7bt" target="_blank" rel="noopener noreferrer">Solscan</a>
          <a href="https://solana.fm/address/8WftAet8HSHskSp8RUVwdPt6xr3CtF76UF5FPmazY7bt?cluster=mainnet-qn1" target="_blank" rel="noopener noreferrer">SolanaFM</a>
        </Col>
        <Col style={{ width: 95 }}>
          <h4>Community</h4>
          <a href="https://twitter.com/KiweMarkets" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://github.com/kiwe-labs" target="_blank" rel="noopener noreferrer">Github</a>
          <a href="https://discord.gg/HBefBzQcdy" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="https://t.me/KiweMarkets" target="_blank" rel="noopener noreferrer">Telegram</a>
        </Col>
      </Row>
    </Footer>
  );
};
