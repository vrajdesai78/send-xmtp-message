import { Web3Modal } from '@/context/web3Modal';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Web3Modal>
        <Toaster position='bottom-center'/>
        <Component {...pageProps} />
      </Web3Modal>
    </>
  );
}
