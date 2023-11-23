import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';
import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { useWalletClient } from 'wagmi';
import toast from 'react-hot-toast';

const Home = () => {
  const [isLoadingBroadCast, setIsLoadingBroadCast] = useState(false);
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingTrivia, setIsLoadingTrivia] = useState(false);
  const [message, setMessage] = useState('');
  const { data: walletClient } = useWalletClient();

  const initXmtp = async () => {
    if (!walletClient) {
      alert('Please connect your wallet');
      setIsLoadingBroadCast(false);
      setIsLoadingSingle(false);
      return;
    }
    const xmtp = await Client.create(walletClient, { env: 'production' });
    return xmtp;
  };

  const broadcastMessages = async () => {
    const client = await initXmtp();
    if (!client) {
      toast.error('Please connect your wallet');
      setIsLoadingBroadCast(false);
      return;
    }
    const response = await fetch(
      `/api/getList?address=0x517dB5491877b5C42Cf52E37dE65993ADf8fb36C`
    );
    const data = await response.json();
    const { addresses } = data;
    console.log(addresses);
    try {
      const broadcasts_canMessage = await client.canMessage(addresses);
      for (let i = 0; i < addresses.length; i++) {
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
      setIsLoadingBroadCast(false);
    } catch (e) {
      toast.error(`Error: ${e}`);
      setIsLoadingBroadCast(false);
      console.log(e);
    }
  };

  const triviaMessage = async () => {
    const client = await initXmtp();
    if (!client) {
      toast.error('Please connect your wallet');
      setIsLoadingBroadCast(false);
      return;
    }

    const response = await fetch(
      `/api/getList?address=0x517dB5491877b5C42Cf52E37dE65993ADf8fb36C`
    );
    const data = await response.json();
    const { addresses } = data;

    const addressesForTrivia = [];

    const allConversations = await client.conversations.list();
    if (!allConversations) return;
    for (const conversation of allConversations) {
      const messages = await conversation.messages();
      if (!messages) return;
      for (const message of messages) {
        if (
          message.content === 'Start the hunt' ||
          message.content === 'Start the Hunt' ||
          (message.content === 'start the hunt' &&
            addresses.includes(message.senderAddress))
        ) {
          addressesForTrivia.push(message.senderAddress);
        }
      }
    }

    try {
      const broadcasts_canMessage = await client.canMessage(addressesForTrivia);
      for (let i = 0; i < addressesForTrivia.length; i++) {
        //Checking the activation status of each wallet
        const wallet = addressesForTrivia[i];
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
      setIsLoadingBroadCast(false);
    } catch (e) {
      toast.error(`Error: ${e}`);
      setIsLoadingBroadCast(false);
      console.log(e);
    }

  };

  const previewMessage = async () => {
    const client = await initXmtp();
    if (!client) {
      toast.error('Please connect your wallet');
      setIsLoadingSingle(false);
      return;
    }
    const addresses = ['0x3039e4a4a540F35ae03A09f3D5A122c49566f919'];
    try {
      const broadcasts_canMessage = await client.canMessage(addresses);
      for (let i = 0; i < addresses.length; i++) {
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
      toast.success('Preview message sent');
      setIsLoadingSingle(false);
    } catch (e) {
      toast.error(`Error: ${e}`);
      console.log(e);
      setIsLoadingSingle(false);
    }
  };

  return (
    <>
      <div className="flex m-4 justify-end">
        <w3m-button />
      </div>
      <div className="flex flex-col gap-4 h-[90vh] justify-center items-center">
        <textarea
          className="border-2 border-gray-300 text-black p-2 rounded-lg w-3/4 h-1/2 md:w-1/3 md:h-1/2"
          placeholder="Enter message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
            onClick={async () => {
              setIsLoadingSingle(true);
              await previewMessage();
            }}
          >
            {isLoadingSingle ? 'Loading...' : 'Send Preview Message'}
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
            onClick={async () => {
              setIsLoadingBroadCast(true);
              await broadcastMessages();
            }}
          >
            {isLoadingBroadCast ? 'Loading...' : 'Send Broadcast Message'}
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
            onClick={async () => {
              setIsLoadingTrivia(true);
              await triviaMessage();
            }}
          >
            {isLoadingTrivia ? 'Loading...' : 'Send Trivia Message'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
