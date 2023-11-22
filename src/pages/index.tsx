import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';
import { useState } from 'react';
import { useEthersProvider } from '@/utils/ethers';
import { BrowserProvider } from 'ethers';
import { useWalletClient } from 'wagmi';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: walletClient } = useWalletClient();

  const initXmtp = async () => {
    setIsLoading(true);
    if (!walletClient) {
      return;
    }
    const xmtp = await Client.create(walletClient, { env: 'production' });
    return xmtp;
  };

  const broadcastMessages = async () => {
    const client = await initXmtp();
    if (!client) {
      return;
    }
    const response = await fetch(
      `/api/getList?address=0x517dB5491877b5C42Cf52E37dE65993ADf8fb36C`
    );
    const data = await response.json();
    const { addresses } = data;
    try {
      const broadcasts_canMessage = await client.canMessage(addresses);
      for (let i = 0; i < addresses.length; i++) {
        console.log('inside for loop');
        //Checking the activation status of each wallet
        const wallet = addresses[i];
        const canMessage = (broadcasts_canMessage as any)[i];
        console.log(wallet, canMessage);
        if ((broadcasts_canMessage as any)[i]) {
          //If activated, start
          const conversation = await client.conversations.newConversation(
            wallet
          );
          // Send a message
          await conversation.send(message);
        }
      }
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div></div>
      <div className="flex flex-col gap-4 h-screen w-screen justify-center items-center">
        <w3m-button />
        <textarea
          className="border-2 border-gray-300 text-black p-2 rounded-lg w-1/4 h-48"
          placeholder="Enter message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded" onClick={broadcastMessages}>
          {isLoading ? 'Loading...' : 'Send Message'}
        </button>
      </div>
    </>
  );
};

export default Home;
