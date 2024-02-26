import axios from 'axios';
import { FrameParser, OgTags } from '../frameParser';
import { getFrameMetadata} from '../app-sdk/getFrameMetadata';
import fs from 'fs';
import path from 'path';

const TEST_PROXY_URL = 'http://local.proxy.com';
const tensorUrl = 'https://www.tensor.trade/trade/jules_l_splx'

describe('fetchPageContents Function', () => {
  let frameParser: FrameParser;

  beforeEach(async () => {
    frameParser = new FrameParser(TEST_PROXY_URL);
  })
  
  it('should fetch content from tensor', async () => {
    const url = tensorUrl; 
    const content = await frameParser.fetchPageContents(url);
    const ogTags = await frameParser.parseOgTagsFromPageContents(content);
    const frameObject = frameParser.createFrameFromOGTags(ogTags, tensorUrl)

    expect(content).toBeDefined();
    expect(frameObject).toEqual({
      result: {
        success: true,
        isFrame: false,
        frame: {},
        ogTags: {
          error: '',
          likely_type: 'html',
          url: 'https://www.tensor.trade/trade/jules_l_splx',
          title: "Tensor | Solana's Leading NFT Marketplace",
          description: 'Tensor is the #1 NFT Marketplace on Solana. Backed by Placeholder VC, Solana Ventures, and Solana founders Toly and Raj.',
          image: 'http://local.proxy.com/imgproxy?url=https%3A%2F%2Fi.ibb.co%2FZMRt7cp%2Ftt.png'
        },
      },
    });
    // end
  }, 30000); 
});
