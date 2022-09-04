import React, { useState } from 'react';
import KiweModal from './Modal';
import { Button, Checkbox } from 'antd';
import { useLocalStorageState } from '../utils/utils';
import styled from 'styled-components';

const AcceptButton = styled(Button)`
    margin: 20px 0px 0px 0px;
    background: linear-gradient(100.61deg, #313F5C 0%, #313F5C 100%) !important;
    border: 2px solid #313F5C !important;
    width: 100%;
    border-radius: 8px;
    font-weight: 500;
    font-size: 16px;

    &:disabled {
        background: #262C39 !important;
        border: 2px solid #262C39 !important;
        color: #565859 !important; 
    }
`;

const DisclaimerModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose?: (x) => void
}) => {
    const [, setAlphaAccepted] = useLocalStorageState('is_disclaimer_ok_13052022', false)
    const [acceptRisks, setAcceptRisks] = useState(false)

    const handleGetStarted = () => {
        setAlphaAccepted(true)
    }

    console.log('render modal');

    return (
        <KiweModal isOpen={isOpen} onClose={onClose} hideClose title={"WARNING"}>
            <>
                <div className="space-y-3 rounded-md bg-th-bkg-3 p-4" >
                    <p>
                        Kiwe is a fully decentralised digital asset exchange powered by the <a href="https://github.com/project-serum/serum-dex" target="_blank" rel="noopener noreferrer">Project Serum smart contracts.</a> No representation or warranty is made concerning any aspect of Kiwe Markets, including its suitability, quality, availability, accessibility, accuracy or safety. Your access to and use of Kiwe Markets is entirely at your own risk and could lead to substantial losses. You take full responsibility for your use of Kiwe Markets, and acknowledge that you use it on the basis of your own enquiry, without solicitation or inducement by Contributors.
                    </p>

                    <p>
                        Kiwe is unavailable to users located or residing in <a href="https://docs.kiwe.markets/resources/restricted-jurisdictions" target="_blank" rel="noopener noreferrer">Prohibited Jurisdicitons.</a> 
                    </p>                   

                    <p>
                        The values of cryptocurrencies are extremely volatile and may fluctuate significantly. There is a substantial risk of economic loss when purchassing, holding, trading, or investing in cryptocurrencies. By accessing and using this Serum-Based frontend you acknowledge and agree that: <br/><br/> 1 - YOU ARE AWARE OF THE RISKS ASSOCIATED WITH TRANSACTIONS OF CRYPTOCURRENCIES THAT ARE BASED ON BLOCKCHAIN AND CRYPTOGRAPHY TECHNOLOGIES AND ARE ISSUED AND MANAGED IN A DECENTRALIZED FORM. <br/><br/> 2 - YOU SHALL ASSUME ALL RISKS RELATED TO THE USE OF THIS APP AND TRANSACTIONS OF CRYPTOCURRENCIES. <br/><br/> 3 - THE KIWE DECENTRALISED ANONYMOUS ORGANISATION SHALL NOT BE LIABLE FOR ANY LOSS OR ADVERSE OUTCOMES. 
                    </p>

                    <p>
                        For more information please read the <a href="https://kiwe.markets/rules.pdf" target="_blank" rel="noopener noreferrer">Rules</a> and the <a href="https://kiwe.markets/risk-statement.pdf" target="_blank" rel="noopener noreferrer">Risk Statement</a>
                    </p>
                    <p>
                        Cookies are used to enhance the services available to you. You agree to the use of cookies.
                    </p>
                </div>
                <div style={{ marginTop: "22px" }}>
                    <Checkbox
                        checked={acceptRisks}
                        onChange={(e) => setAcceptRisks(e.target.checked)}
                    >
                        I confirm that I have read, understand and accept the Rules and Risk Statement
                    </Checkbox>
                </div>
                <div style={{ marginTop: "34px" }}>
                    <AcceptButton
                        className="w-40"
                        disabled={!acceptRisks}
                        onClick={handleGetStarted}
                        type="primary"
                        size="large"
                    >
                        Accept and enter
                    </AcceptButton>
                </div>
            </>
        </KiweModal>
    )
}

export default React.memo(DisclaimerModal)
