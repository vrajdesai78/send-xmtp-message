import { Client } from '@xmtp/xmtp-js';
import { useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const Home = () => {
  const [isLoadingBroadCast, setIsLoadingBroadCast] = useState(false);
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingTrivia, setIsLoadingTrivia] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [message, setMessage] = useState('');
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const { address } = useAccount();

  const initXmtp = async () => {
    if (address !== '0xb64d29882530413cFEbfc082647AcCC01Dfe765F' || !walletClient) {
        toast.error('Please connect to filtreasurehunt.eth to send trivia message');
        setIsLoadingBroadCast(false);
        setIsLoadingSingle(false);
        return;
    }
    if (!walletClient) {
      alert('Please connect your wallet');
      setIsLoadingBroadCast(false);
      setIsLoadingSingle(false);
      return;
    }
    const xmtp = await Client.create(walletClient, { env: 'production' });
    return xmtp;
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
      console.log(conversation.peerAddress);
      const messages = await conversation.messages();
      if (!messages) return;
      for (let i = messages.length - 1; i >= 0; i--) {
        console.log(messages[i].content);
        if (
          messages[i].content === 'Start the hunt' ||
          messages[i].content === 'Start the Hunt' ||
          (messages[i].content === 'start the hunt' &&
            addresses.includes(messages[i].senderAddress))
        ) {
          addressesForTrivia.push(messages[i].senderAddress);
          break;
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
      setIsLoadingTrivia(false);
    } catch (e) {
      toast.error(`Error: ${e}`);
      setIsLoadingTrivia(false);
      console.log(e);
    }

    console.log(addressesForTrivia);
  };

  const sendPreviewMessage = async () => {
    const client = await initXmtp();
    if (!client) {
      toast.error('Please connect your wallet');
      setIsLoadingSingle(false);
      return;
    }
    const addresses = [
      '0x3039e4a4a540F35ae03A09f3D5A122c49566f919',
      '0xCAa931a56cCbF30B82CED72604DdC7182964bB71',
    ];
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

      const conversations = await client.conversations.list();
      if (!conversations) return;

      const messages = await conversations[0].messages();

      if (!messages) return;
      setPreviewMessage(
        messages[messages.length - 1].content?.toString() || ''
      );

      setIsLoadingSingle(false);
    } catch (e) {
      toast.error(`Error: ${e}`);
      console.log(e);
      setIsLoadingSingle(false);
    }
  };

  return (
    <>
      <div className="flex m-4 justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
          onClick={() => router.push('/')}
        >
          Send Broadcast
        </button>
        <w3m-button balance="hide" />
      </div>
      <div className="flex flex-col gap-4 h-[90vh] justify-center items-center">
        <textarea
          className="border-2 border-gray-300 text-black p-2 rounded-lg w-3/4 h-1/2 md:w-1/3 md:h-1/2"
          placeholder="Enter message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {previewMessage !== '' && (
          <>
            <span>Preview Message </span>
            <div className="w-3/4 md:w-1/3 bg-white border-gray-300 rounded-lg text-black p-2">
              {previewMessage}
            </div>
          </>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
            onClick={async () => {
              setIsLoadingSingle(true);
              await sendPreviewMessage();
            }}
          >
            {isLoadingSingle ? 'Loading...' : 'Send Preview Message'}
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
