// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;
  const response = await fetch(
    `https://api.simplehash.com/api/v0/nfts/ethereum-goerli/${address}`,
    {
      method: 'GET',
      headers: {
        'x-api-key':
          process.env.SIMPLEHASH_API_KEY || '',
      },
    }
  );
  const data = await response.json();

  const addresses: Set<string> = new Set();
  
  for (const nfts of data.nfts) {
    const { owners } = nfts;
    addresses.add(owners[0].owner_address);
  }

  res.status(200).json({ addresses: Array.from(addresses) });
}
