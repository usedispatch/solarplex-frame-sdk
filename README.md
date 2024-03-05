# solarplex-frame-sdk

This SDK helps write applications for Solarplex Frames. 

A great place to start would be the demo app at https://github.com/usedispatch/solarplex-polls-demo and the example app at https://github.com/usedispatch/solarplex-frame-demo

Validate your frames at 

https://www.solarplex.xyz/developer/frames

<img width="1174" alt="image" src="https://github.com/usedispatch/solarplex-frame-sdk/assets/198669/b6c8c385-29cf-4df4-990a-c39b98db99d9">

# A Frame in 100 lines (or less)

NB: Forked from the original farcaster frames and modified to support Solarplex
H/T to @zizzamia on [Warpcast](https://warpcast.com/zizzamia) or [X](https://twitter.com/Zizzamia).


Solarplex Frames in less than 100 lines, and ready to be deployed to Vercel.

<br />

<br />

## Sample app
```
import { getFrameMetadata } from '@usedispatch/solarplex-frame-sdk';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from '../config';

// This is the first page that Solarplex frame parser sees
// Solarplex frames support the farcaster spec. Details coming soon.

// Create the first frame metadata
// Add 2 buttons, an image, 
// NOTE: Text input is coming soon, not yet supported. Here for completeness.
const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Button 1',
    },
    {
      label: 'Button 2',
    },
  ],
  image: `${NEXT_PUBLIC_URL}/park-1.png`,
  input: {
    text: 'This is a placeholder for text input',
  },
  // This is the base URL for all requests that will be sent from this page
  // Clicking button 1 vs button 2 will simply send FrameActionIndex 1 or 2 
  // to this API, and you'll have to handle that.
  // See app/api/frame/route.ts for how to do that.
  post_url: `${NEXT_PUBLIC_URL}/api/frame`,
});


// This is the next JS OG tag metadta
// Solarplex frame metadata is just another OG Tag
// The convenience functions above make it easy to create them
//  programmaticallly
export const metadata: Metadata = {
  title: 'Solarplex frame demo',
  description: 'LFG Solarplex Frames Demo!',
  openGraph: {
    title: 'Solarplex frame demo',
    description: 'Solarplex frame demo app available at github.com/usedispatch/solarplex-frame-demo',
    images: [`${NEXT_PUBLIC_URL}/park-1.png`],
  },
  other: {
    ...frameMetadata,
  },
};

console.log('netadata', metadata)
export default function Page() {
  return (
    <>
      <h1>Welcome to the Solarplex Frames 1 demo</h1>
    </>
  );
}

```


<br />

## Resources

- [Solarplex Frames documentation](https://docs.solarplex.xyz)

<br />

## The Team and Our Community ☁️ 🌁 ☁️

@solarplex_xyz

<br />

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
