import React, { useEffect, useState } from 'react';
import cgTokens from "../config/cg_ids.json";
import CoinLogos from "../config/logos.json";
import { makeStyles } from "@material-ui/core";
import { Carousel } from 'antd';
import "../Overview.less";

const useStyles = makeStyles((theme) => ({
  walletIdCopyIcon: {
        padding: "5px",
        marginLeft: "4px",
        borderRadius: "50%",
        background: "linear-gradient(100.61deg, #B34FFF 0%, #B34FFF 100%)",
        color: "#fff",
        width: "26px",
        height: "26px",
        "& svg": {
            height: "16px",
            marginRight: "5px"
        }
    },
}));

export default function HomePage() {
  const [activeSwapNav, setActiveSwapNav] = useState<boolean>(false);
  const [navExpanded, setNavExpanded] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [tokens, setTokens] = useState<any>({
    SOL: null,
    SRM: null,
    BTC: null,
    FTT: null,
    MNGO: null,
    RAY: null,
    ORCA: null,
    FIDA: null,
    DXL: null,
    STEP: null,
  });

  function getToken(token, id) {
    const cgToken = cgTokens.find(cgToken => cgToken.symbol.toUpperCase() === token);
    fetch(`https://api.coingecko.com/api/v3/coins/${id}?tickers=false&community_data=false&developer_data=false&sparkline=true`)
      .then(response => response.json())
      .then(json => {
        if (json) {
          setTokens((prevState) => ({ ...prevState, [token]: json }));
        }
      });
  }

  function expandNav(e) {
    e.preventDefault();
    setNavExpanded(true);
  }

  function collapseNav(e) {
    e.preventDefault();
    setNavExpanded(false);
  }

  function hoverSwap() {
    setActiveSwapNav(true);
  }

  function exitSwap() {
    setActiveSwapNav(false);
  }

  useEffect(() => {
    Object.keys(tokens).map(token => {
      const cgToken = cgTokens.find(cgToken => cgToken.symbol.toUpperCase() === token);
      if (cgToken) {
        getToken(token, cgToken.id);
      }
    });
  }, []);

  const kiweSPLAddress = "8WftAet8HSHskSp8RUVwdPt6xr3CtF76UF5FPmazY7bt";

  return (
    <>
      <div className="container-home">
        <div className="section teaser dex">
          <div className="inner">
            
            <p> For projects and traders who likes simple and user-friendly interface.</p>
            
            <h5>
              POWERED BY
            </h5>
            <img  src="/images/logo_serum.svg" alt="SERUM" /> 
          </div>
        </div>
  
        <div className="section tokens">
          <div className="track cards" style={{ width: 265 * 9 }}>
            {Object.keys(tokens).map(token => (
              <div key={token} className="token card">
                <div className="inner">
                  <div className="ticker">
                    <img src={CoinLogos[token]} />
                    {token}
                  </div>
                  {tokens[token] ?
                    <>
                      <strong>
                        {tokens[token].market_data?.current_price?.["usd"] ?
                          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(tokens[token].market_data.current_price["usd"])
                        : "-"}
                      </strong>
                      {tokens[token].market_data?.price_change_percentage_24h &&
                        <sub className={tokens[token].market_data?.price_change_percentage_24h >= 0 ? "gain" : "loss"}>
                          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                            <path d="M6.06218 0.499999C6.44708 -0.166667 7.40933 -0.166667 7.79423 0.5L12.9904 9.5C13.3753 10.1667 12.8942 11 12.1244 11H1.73205C0.96225 11 0.481125 10.1667 0.866025 9.5L6.06218 0.499999Z" fill="#96FF00"/>
                          </svg>
                          {tokens[token].market_data.price_change_percentage_24h.toFixed(2)}%
                        </sub>
                      }
                  </>
                  : <p><em>Loading...</em></p>}
                </div>
              </div>
            ))} 
          </div>
        </div>

        <div className="section teaser community">
          <div className="inner">
            
            <p>
              We are a community driven organisation and all the code source used remain free and open source.
            </p>

            <a href="https://discord.gg/HBefBzQcdy" target="_blank" rel="noopener noreferrer" style={{ position: 'relative', cursor: 'pointer' }}>
              Join Discord &gt;
            </a>
            <a href="https://twitter.com/KiweMarkets" target="_blank" rel="noopener noreferrer" style={{ position: 'relative', cursor: 'pointer' }}>
              Follow us on Twitter &gt;
            </a>
          </div>
        </div>

        <div className="section kiwe">
          <div className="kiwe-header">
            <div className="inner">
              <h2 style={{ color:'#fff'}}>KIWE Token</h2>
              <p className="address">
                {kiweSPLAddress}
              </p>
              <div className="links">
                <a href="https://docs.kiwe.markets/kiwe-token/token-details" target="_blank" rel="noopener noreferrer">
                  Token Details &gt;  
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="section services">
          <div className="cards">
            <div className="card">
              <h4>Open Source</h4>
              <p>Kiwe Markets is completely open-source. You can use it, improve it or learn from it. But most of all have fun with it &#127881;</p>
              <a href="https://github.com/kiwe-labs" className="link" target="_blank" rel="noopener noreferrer">Find us on GitHub &gt;</a>
            </div>
            <div className="card">
              
              <h4>Help Build</h4>
              <p>If you want to contribute you can check the to do list, see the developments already completed and track projects progress.</p>
              <a href="https://trello.com/b/HX6LIaau/kiwe-development" className="link" target="_blank" rel="noopener noreferrer">Contribute &gt;</a>
            </div>
            <div className="card">
             
              <h4>Listing</h4>
              <p>We are always looking for fun projects ! If you are interesting for a partnership don't hesitate and fill the form &#128540; </p>
              <a href="https://forms.gle/iNiPGWRhUEBxcjyQ6" className="link" target="_blank" rel="noopener noreferrer">Submit request &gt;</a>
            </div>
          </div>
        </div>

        <div className="section teaser docs">
          <div className="inner">
    
            <p>
              Explore the documentations and learn about KIWE token, governance system, interacting with Kiwe Markets and more.
            </p>

            <a href="https://docs.kiwe.markets/" target="_blank" rel="noopener noreferrer">
              Explore the docs &gt;
            </a>
          </div>
        </div>

      </div>
    </>
  );
};

const LinearGradientFill = () => {
  return (
    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="rgb(255, 129, 10, 0.2)" stopOpacity="1" />
      <stop offset="100%" stopColor="255, 171, 92, 0" stopOpacity="0" />
    </linearGradient>
  );
};
