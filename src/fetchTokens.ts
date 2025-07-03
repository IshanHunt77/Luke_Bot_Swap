import { Readable } from 'stream';
// @ts-ignore if needed for TS
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain';
import prisma from './prisma';
import { pipeline } from 'node:stream/promises';

interface Token {
  symbol : string;
  name : string;
  address : string;
  decimals : number;
}
const getTokenFromDb = async (symbol: string) => {
  try {
    const token = await prisma.token.findFirst({
      where: { symbol }
    });
    if (token) {
      tokens.set(symbol, {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        decimals: token.decimals
      });
    }
  } catch (e: any) {
    console.log("Error:", e);
  }
};

export const tokens = new Map<string,Token>()
export const fetchAndStoreTokens = async (symbol1: string, symbol2: string) => {
  await getTokenFromDb(symbol1);
  await getTokenFromDb(symbol2)
  if(tokens.size==2){
    return
  }
  const res = await fetch("https://lite-api.jup.ag/tokens/v1/all");
  if (!res.ok || !res.body) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const nodeStream = Readable.fromWeb(res.body as any);

  const chainStream = chain([
    nodeStream,
    parser(),
    streamArray()
  ]);

  let found = 0;

  for await (const { value } of chainStream) {
    const { symbol, name, address, decimals } = value;
    if (!symbol || !name || !address || decimals === undefined) continue;

    if (symbol === symbol1 || symbol === symbol2) {
      tokens.set(symbol, { symbol, name, address, decimals });
      console.log("Parsed token:", symbol);
      found++;
      await prisma.token.create({
        data : {
        symbol,
        name,
        address,
        decimals
        }
      })
    }

    if (found === 2) {
      console.log("destroying")
      
      // Manually stop the stream
      chainStream.destroy(); // 👈 this prevents the abort error
      break;
    }
  }

  console.log("✅ Token import completed.");
  console.log(tokens.get(symbol1));
};


// fetchAndStoreTokens().catch(err => {
//   console.error("❌ Fetch/store failed:", err);
// });


