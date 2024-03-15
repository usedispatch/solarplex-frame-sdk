// jest.mock('axios', () => require('./mockAxios'));
// import { setupDefaultMockResponse } from './mockAxios';
import axios from 'axios';
import { callPostFrameAction } from '../postFrameAction';

import { getFrameMetadata } from '../app-sdk/getFrameMetadata';

// assumes github.com/@usedispatch/solarplex-frame-demo running:
// PORT=9002 yarn dev

const NEXT_PUBLIC_URL = 'http://localhost:9002';
export const config = {
  publicRuntimeConfig: {
    NEXT_PUBLIC_URL,
  },
};
const ctx = {
  cfg: {
    publicUrl: NEXT_PUBLIC_URL
  }
};

describe('postFrameAction spec', () => {
  it('tests postFrameAction 300 redirect on localhost', async () => {
    
    const data = {
      frameActionIndex: 1,
      framePostUrl: `${NEXT_PUBLIC_URL}/api/frame-redirect`,
      inputText: "",
      itemCid: "bafyreiah53pto4kwzjiyzlwxlajneshidoxrhr6xslbbeqyqkxlig32rey",
      itemUri: "at://did:plc:f5iawtht7iqiy3muxrdjfcee/app.bsky.feed.post/3kme5bqg3zk2x",
      author: "did:plc:f5iawtht7iqiy3muxrdjfcee",
      did: "did:plc:f5iawtht7iqiy3muxrdjfcee",
      linkedWallet: "",
      connectedWallet: "",
      likedPost: true,
      repostedPost: false,
      followsAuthor: 1,
      txnSignature: ""
    };
    
    const res = await callPostFrameAction({...data, ctx});
    expect(res.body.result).toEqual({
      success: true,
      isFrame: false,
      isRedirect: true,
      redirectUrl: 'https://www.google.com/search?q=cute+dog+pictures&tbm=isch&source=lnms',
      redirectStatus: 302,
      frame: {},
      ogTags: {}
    })
  });

  it('tests postFrameAction 200 OK on localhost, button 1', async () => {
    const data = {
      frameActionIndex: 1,
      framePostUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      inputText: "",
      itemCid: "bafyreiah53pto4kwzjiyzlwxlajneshidoxrhr6xslbbeqyqkxlig32rey",
      itemUri: "at://did:plc:f5iawtht7iqiy3muxrdjfcee/app.bsky.feed.post/3kme5bqg3zk2x",
      author: "did:plc:f5iawtht7iqiy3muxrdjfcee",
      did: "did:plc:f5iawtht7iqiy3muxrdjfcee",
      linkedWallet: "",
      connectedWallet: "",
      likedPost: true,
      repostedPost: false,
      followsAuthor: 1,
      txnSignature: ""
    };
    
    const res = await callPostFrameAction({...data, ctx});
    expect(res.body.result.success).toBe(true);
    expect(res.body.result.isFrame).toBe(true);
    expect(res.body.result.frame).toEqual(expect.objectContaining({
      version: "vNext",
      image: expect.stringContaining("localhost:9002/imgproxy"),
      post_url: expect.any(String),
      input: expect.objectContaining({
        text: expect.any(String)
      }),
      buttons: expect.arrayContaining([
        expect.objectContaining({
          index: 1,
          label: "🌲 You submitted the text: ",
          action: "post"
        })
      ])
    }));
    expect(res.body.result).toEqual({
      success: true,
      isFrame: true,
      frame: {
        version: "vNext",
        image: expect.any(String),
        post_url: expect.any(String),
        input: { text: "" },
        buttons: [
          { index: 1, label: "🌲 You submitted the text: ", action: "post" },
        ]
      },
      ogTags: {
        error: "",
        likely_type: "frame",
        url: expect.any(String),
        title: "",
        description: "",
        image: expect.any(String)
      }
    });
  });
  
  it('tests postFrameAction 200 OK on localhost, button 2', async () => {
    const data = {
      frameActionIndex: 2,
      framePostUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      inputText: "",
      itemCid: "bafyreiah53pto4kwzjiyzlwxlajneshidoxrhr6xslbbeqyqkxlig32rey",
      itemUri: "at://did:plc:f5iawtht7iqiy3muxrdjfcee/app.bsky.feed.post/3kme5bqg3zk2x",
      author: "did:plc:f5iawtht7iqiy3muxrdjfcee",
      did: "did:plc:f5iawtht7iqiy3muxrdjfcee",
      linkedWallet: "",
      connectedWallet: "",
      likedPost: true,
      repostedPost: false,
      followsAuthor: 1,
      txnSignature: ""
    };
  
    const res = await callPostFrameAction({...data, ctx});
    console.log(res.body.result.frame);
    expect(res.body.result).toEqual({
      success: true,
      isFrame: true,
      frame: expect.objectContaining({
        version: "vNext",
        image: expect.stringContaining("localhost:9002/imgproxy"),
        post_url: expect.any(String),
        input: expect.objectContaining({
          text: expect.any(String)
        }),
        buttons: [
          expect.objectContaining({
            index: 1,
            label: "Button 1",
            action: "post"
          }),
          expect.objectContaining({
            index: 2,
            label: "🌲 Text: view transaction on xray!",
            action: "post_redirect",
            post_url: expect.any(String),
          })
        ],
        refresh_period: undefined
      }),
      ogTags: expect.objectContaining({
        error: "",
        likely_type: "frame",
        url: expect.any(String),
        title: "",
        description: "",
        image: expect.stringContaining("localhost:9002/imgproxy?url=")
      })
    });
  });
  

});


/**
 *  sample code for mocking up nextjs
 * 
 *  // WIP
    function Page(metadata: any) {
      // mock up the nextjs page function
      const metaTags = Object.entries(metadata.other).map(([name, content]) => `<meta name="${name}" content="${content}"/>`).join('\n');
      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charSet="utf-8"/>
      <title>${metadata.title}</title>
      <meta name="description" content="${metadata.description}"/>
      ${metaTags}
      </head>
      <body>
      <h1>${metadata.title}</h1>
      </body>
      </html>
      `;
    }

 *  // const frameMetadata = getFrameMetadata({
    //   buttons: [
    //     {
    //       label: 'Redirect to cute dog pictures',
    //       action: 'post_redirect',
    //     },
    //   ],
    //   image: '/park-1.png',
    //   post_url: `${NEXT_PUBLIC_URL}/api/frame-redirect`,
    // });
    
    // const metadata = {
    //   title: 'zizzamia.xyz',
    //   description: 'LFG',
    //   openGraph: {
    //     title: 'zizzamia.xyz',
    //     description: 'LFG',
    //     images: [`${NEXT_PUBLIC_URL}/park-1.png`],
    //   },
    //   other: {
    //     ...frameMetadata,
    //   },
    // };

    // (axios.post as jest.Mock).mockResolvedValueOnce({
    //   data: Page(metadata),
    //   status: 200,
    //   statusText: 'OK',
    //   headers: {},
    //   config: {},
    // });

 */