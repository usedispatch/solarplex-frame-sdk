import axios from 'axios';
import { FrameParser } from '../frameParser';
import fs from 'fs';
import path from 'path';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const TEST_PROXY_URL = 'http://local.proxy.com'

describe('FrameParser with YouTube URL', () => {
  let frameParser: FrameParser;
  const youtubeUrl = 'https://www.youtube.com/watch?v=TWTmSlxYJTI';

  beforeEach(async () => {
    frameParser = new FrameParser(TEST_PROXY_URL);
    const mockedHtmlFilePath = path.join(__dirname, 'mockedYoutubeResponse.html');
    const mockedHtmlResponse = await fs.promises.readFile(mockedHtmlFilePath, { encoding: 'utf-8' });
    mockedAxios.get.mockResolvedValue({ data: mockedHtmlResponse });
  });

  it('should parse ogTags correctly for a YouTube URL', async () => {
    const ogTags = await frameParser.parseOgTagsFromPageContents(await frameParser.fetchPageContents(youtubeUrl));
    const frameObject = frameParser.createFrameFromOGTags(ogTags, youtubeUrl)
    console.log(frameObject.result.ogTags)
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
    console.log(frameObject.result.frame, frameObject.result.isFrame)
    expect(typeof frameObject.result.frame).toBe('object');
    expect(frameObject.result.frame).not.toBeNull();     
    expect(frameObject.result.frame).toEqual({});
    expect(frameObject.result.isFrame).toBe(false);
  });

});