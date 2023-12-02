import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Client } from '@xmtp/xmtp-js';
import {
  Attachment,
  AttachmentCodec,
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
} from '@xmtp/content-type-remote-attachment';

const Reveal = () => {
  const [isLoadingBroadCast, setIsLoadingBroadCast] = useState(false);
  const { data: walletClient } = useWalletClient();

  const initXmtp = async () => {
    if (!walletClient) {
      alert('Please connect your wallet');
      setIsLoadingBroadCast(false);
      return;
    }
    const xmtp = await Client.create(walletClient, { env: 'production' });
    return xmtp;
  };

  const sendRevealedNFTWithAddress = async () => {
    const client = await initXmtp();
    client?.registerCodec(new AttachmentCodec());
    if (!client) {
      alert('Please connect your wallet');
      setIsLoadingBroadCast(false);
      return;
    }

    const addresses = [
      '0xCa49ABcDC4F7E95d122Cb1F0895f01B7a6Ba0d20',
      '0x8f211C25ed36B359Fa81eB2b84bFc09dB6c258F6',
      '0x7fE83c02C89F7252664132470D800aB4ef14Df70',
    ];

    try {
      const broadcasts_canMessage = await client.canMessage(addresses);
      for (let i = 0; i < addresses.length; i++) {
        //Checking the activation status of each wallet
        const wallet = addresses[i];
        const canMessage = (broadcasts_canMessage as any)[i];

        console.log(wallet, canMessage);

        if (broadcasts_canMessage[i]) {
          //If activated, start
          const conversation = await client.conversations.newConversation(
            wallet
          );

          const fileBlob = await fetch(`/output/${i + 1}.png`).then((r) =>
            r.blob()
          );

          const attachment: Attachment = {
            filename: `${i + 1}.png`,
            mimeType: fileBlob.type,
            data: new Uint8Array(await fileBlob.arrayBuffer()),
          };

          const res = await conversation.send(attachment as any, {
            contentType: ContentTypeAttachment,
          });

          console.log({ res });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const sendRevealedNFTWithTokenId = async () => {
    const client = await initXmtp();
    client?.registerCodec(new AttachmentCodec());
    if (!client) {
      alert('Please connect your wallet');
      setIsLoadingBroadCast(false);
      return;
    }
    for (let i = 1; i <= 10; i++) {
      const response = await fetch(`/api/getAddress?tokenId=${i}`);
      const data = await response.json();
      const { address } = data;
      try {
        const canMessage = await client.canMessage(address);

        console.log(address, canMessage);

        if (address) {
          //If activated, start
          const conversation = await client.conversations.newConversation(
            address
          );

          const fileBlob = await fetch(`/output/${i + 1}.png`).then((r) =>
            r.blob()
          );

          const attachment: Attachment = {
            filename: `${i + 1}.png`,
            mimeType: fileBlob.type,
            data: new Uint8Array(await fileBlob.arrayBuffer()),
          };

          const res = await conversation.send(attachment as any, {
            contentType: ContentTypeAttachment,
          });

          console.log({ res });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div className='flex gap-2'>
      <button
        className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
        onClick={async () => {
          setIsLoadingBroadCast(true);
          await sendRevealedNFTWithAddress();
        }}
      >
        {isLoadingBroadCast ? 'Loading...' : 'Send Reveal NFT with Address'}
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
        onClick={async () => {
          setIsLoadingBroadCast(true);
          await sendRevealedNFTWithTokenId();
        }}
      >
        {isLoadingBroadCast ? 'Loading...' : 'Send Reveal NFT with Token ID'}
      </button>
    </div>
  );
};

export default Reveal;
