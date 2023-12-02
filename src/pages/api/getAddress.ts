import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import abi from '../../utils/abi.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tokenId } = req.query;
  // create provider for arbitrum network
  const provider = new ethers.JsonRpcProvider(
    'https://arb-pokt.nodies.app'
  );
  // create contract instance
  const contract = new ethers.Contract(
    '0x02c510bE69fe87E052E065D8A40B437d55907B48',
    [
        'function ownerOf(uint256 tokenId) view returns (address)',
    ],
    provider
  );

  try {
    const address = await contract.ownerOf(tokenId);
    res.status(200).json({ address });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
}
