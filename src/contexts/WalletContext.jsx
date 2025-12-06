import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAllowed, setAllowed, getAddress } from '@stellar/freighter-api';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState('');
    const [network, setNetwork] = useState('');
    const [error, setError] = useState('');

    const checkConnection = async () => {
        if (await isAllowed()) {
            const { address } = await getAddress();
            if (address) {
                setAccount(address);
                setIsConnected(true);
            }
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const connect = async () => {
        console.log("Attempting to connect wallet...");
        try {
            const allowed = await setAllowed();
            console.log("setAllowed result:", allowed);
            const { address } = await getAddress();
            console.log("getAddress result:", address);
            if (address) {
                setAccount(address);
                setIsConnected(true);
                console.log("Wallet connected:", address);
            }
        } catch (e) {
            console.error("Failed to connect wallet:", e);
            setError(e.message || "Failed to connect");
        }
    };

    return (
        <WalletContext.Provider value={{ isConnected, account, connect, error }}>
            {children}
        </WalletContext.Provider>
    );
};
