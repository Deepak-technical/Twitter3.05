import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;
const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};

const getEtherumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  // console.log({
  //   provider,
  //   signer,
  //   transactionContract,
  // });
  return transactionContract;
};


export const TransactionProvider = ({ children }) => {
  const [connectedAccount, setCurrentAccount] = useState();
  const[isLoading,setisLoading]=useState(false);
   const[transactionCount,settransactionCount]=useState(localStorage.getItem('transactionnCount'))
   const [transactions, setTransactions] = useState([]);

  const [formData, setFormData] = useState({
    addressTo: "",
    amount: " ",
    keyword: " ",
    message: "",
  });
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask Wallet");
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts Found");
      }
      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask Wallet");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (error) {
      console.log(error);
      throw new Error("No etherum Object");
    }
  };

  const sendTransactions = async () => {
    try {
      if (!ethereum) alert("Metamask Not Connected");
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract =getEtherumContract();
      const pareseAmount=ethers.utils.parseEther(amount)
      await ethereum.request({
        method:'eth_sendTransaction',
        params:[{
          from:connectedAccount,
          to:addressTo,
          gas:'0x5208',
          value:pareseAmount._hex,
        }]
      });

      const transactionHash=await transactionContract.addToBlockchain(addressTo,pareseAmount,message,keyword);
      setisLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setisLoading(false);
      console.log(`Sucess - ${transactionHash.hash}`);
      const transactionCount=await transactionContract.getTransactionCount();
      settransactionCount(transactionCount.toNumber())
    } catch (error) {}
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        connectedAccount,
        formData,
        setFormData,
        handleChange,
        sendTransactions,
        transactions
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
