import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Client } from '@xmtp/xmtp-js';
import { Attachment, ContentTypeAttachment, ContentTypeRemoteAttachment } from '@xmtp/content-type-remote-attachment';

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

  const sendRevealedNFT = async () => {
    const client = await initXmtp();
    if (!client) {
      alert('Please connect your wallet');
      setIsLoadingBroadCast(false);
      return;
    }

    // get images from /output/[number].png and send them to the list of addresses
    // send [1].png to [1] address, [2].png to [2] address, etc.

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
            contentType: ContentTypeAttachment
          });

          console.log({ res });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
      onClick={async () => {
        setIsLoadingBroadCast(true);
        await sendRevealedNFT();
      }}
    >
      {isLoadingBroadCast ? 'Loading...' : 'Send Broadcast Message'}
    </button>
  );
};

export default Reveal;
