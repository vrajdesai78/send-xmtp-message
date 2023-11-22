import { Web3Modal } from '@/context/web3Modal';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Web3Modal>
        <Component {...pageProps} />
      </Web3Modal>
    </>
  );
}
