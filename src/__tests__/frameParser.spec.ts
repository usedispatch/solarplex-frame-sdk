import axios from 'axios';
import { FrameParser, OgTags } from '../frameParser';
import { getFrameMetadata} from '../app-sdk/getFrameMetadata';
import fs from 'fs';
import path from 'path';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const TEST_PROXY_URL = 'http://local.proxy.com';
const NEXT_PUBLIC_URL = 'http://local.server.com';
const youtubeUrl = 'https://www.youtube.com/watch?v=TWTmSlxYJTI';
const frameUrl = 'https://solarplex-frame-demo.vercel.app/';



describe('FrameParser with diff urls', () => {
  let frameParser: FrameParser;

  beforeEach(async () => {
    frameParser = new FrameParser(TEST_PROXY_URL);

    const mockedYoutubeFilePath = path.join(__dirname, 'mockedYoutubeResponse.html');
    const mockedYoutubeResponse = await fs.promises.readFile(mockedYoutubeFilePath, { encoding: 'utf-8' });

    const mockedFrameFilePath = path.join(__dirname, 'frameResponse.html');
    const mockedFrameResponse = await fs.promises.readFile(mockedFrameFilePath, { encoding: 'utf-8' });

    mockedAxios.get.mockImplementation((url) => {
      if (url === youtubeUrl) {
        return Promise.resolve({ data: mockedYoutubeResponse });
      } else if (url === frameUrl) {
        return Promise.resolve({ data: mockedFrameResponse });
      }
      return Promise.reject(new Error('not found'));
    });
    
  });

  it('should parse ogTags correctly for a YouTube URL', async () => {
    const ogTags = await frameParser.parseOgTagsFromPageContents(await frameParser.fetchPageContents(youtubeUrl));
    const frameObject = frameParser.createFrameFromOGTags(ogTags, youtubeUrl)
    expect(frameObject.result.ogTags).toEqual({
        error: '',
        likely_type: 'html',
        url: 'https://www.youtube.com/watch?v=TWTmSlxYJTI',
        title: 'Breakpoint 2023: Social Media on Solana',
        description: '',
        image: `${TEST_PROXY_URL}/imgproxy?url=https%3A%2F%2Fi.ytimg.com%2Fvi%2FTWTmSlxYJTI%2Fmaxresdefault.jpg`
    });
  });

  it('should parse only ogTags for a YouTube URL and frame should be {}', async () => {
    const ogTags = await frameParser.parseOgTagsFromPageContents(await frameParser.fetchPageContents(youtubeUrl));
    const frameObject = frameParser.createFrameFromOGTags(ogTags, youtubeUrl)
    expect(typeof frameObject.result.frame).toBe('object');
    expect(frameObject.result.frame).not.toBeNull();     
    expect(frameObject.result.frame).toEqual({});
    expect(frameObject.result.isFrame).toBe(false);
  });


  it('generates a frame page via the sdk', async () => {
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
      post_url: `${NEXT_PUBLIC_URL}/api/frame`
    })
    expect(typeof frameMetadata).toBe('object');
    expect(frameMetadata).toEqual({
      'sp:frame': 'vNext',
      'sp:frame:image': 'http://local.server.com/park-1.png',
      'sp:frame:input:text': 'This is a placeholder for text input',
      'sp:frame:button:1': 'Button 1',
      'sp:frame:button:2': 'Button 2',
      'sp:frame:post_url': 'http://local.server.com/api/frame'
    });
  });

  it('should parse frames and OG Tags correctly for a valid Frame URL', async () => {
    const ogTags = await frameParser.parseOgTagsFromPageContents(await frameParser.fetchPageContents(frameUrl));
    const frameObject = frameParser.createFrameFromOGTags(ogTags, youtubeUrl)
    expect(frameObject.result.isFrame).toBe(true);
    expect(frameObject.result.frame).toEqual({
      version: 'vNext',
      image: 'http://local.proxy.com/imgproxy?url=https%3A%2F%2Fsolarplex-frame-demo.vercel.app%2F%2Fpark-1.png',
      post_url: 'https://solarplex-frame-demo.vercel.app//api/frame',
      input: { text: 'This is a placeholder for text input' },
      buttons: [
        { index: 1, label: 'Button 1', action: 'post' },
        { index: 2, label: 'Button 2', action: 'post' },
      ],
      refresh_period: undefined
    });
    expect(frameObject.result.ogTags).toEqual({
      error: '',
      likely_type: 'frame',
      url: 'https://www.youtube.com/watch?v=TWTmSlxYJTI',
      title: 'Solarplex frame demo',
      description: 'Solarplex frame demo app available at github.com/usedispatch/solarplex-frame-demo',
      image: 'http://local.proxy.com/imgproxy?url=https%3A%2F%2Fsolarplex-frame-demo.vercel.app%2F%2Fpark-1.png'
    });
    
  });

  it('correctly parses buttons and their actions from fetched metadata', () => {
    const fetchedMeta: OgTags = {
      "sp:frame": "vNext",
      "sp:frame:image": "https://example.com/image.png",
      "sp:frame:button:1": "Button Label 1",
      "sp:frame:button:1:action": "post_redirect",
      "sp:frame:button:2": "Button Label 2",
      // assuming button 2 does not have an explicit action, so it defaults to "post"
      "sp:frame:post_url": "https://example.com/api/frame-redirect",
      "og:title": "Example Title"
    };

    const expectedButtons = [
      { index: 1, label: "Button Label 1", action: "post_redirect" },
      { index: 2, label: "Button Label 2", action: "post" }
    ];

    const buttons = frameParser.parseButtonsFromFetchedMeta(fetchedMeta);
    expect(buttons).toEqual(expectedButtons);
  });

});

  