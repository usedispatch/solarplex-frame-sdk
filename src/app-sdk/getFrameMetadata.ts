import { FrameMetadataType } from './types';

type FrameMetadataResponse = Record<string, string>;

/**
 * This function generates the metadata for a Farcaster Frame.
 * @param buttons: The buttons to use for the frame.
 * @param image: The image to use for the frame.
 * @param input: The text input to use for the frame.
 * @param post_url: The URL to post the frame to.
 * @param refresh_period: The refresh period for the image used.
 * @returns The metadata for the frame.
 */
export const getFrameMetadata = function ({
  buttons,
  image,
  input,
  post_url,
  refresh_period,
}: FrameMetadataType): FrameMetadataResponse {
  const metadata: Record<string, string> = {
    'sp:frame': 'vNext',
  };
  metadata['sp:frame:image'] = image;
  if (input) {
    metadata['sp:frame:input:text'] = input.text;
  }
  if (buttons) {
    buttons.forEach((button, index) => {
      metadata[`sp:frame:button:${index + 1}`] = button.label;
      if (button.action) {
        metadata[`sp:frame:button:${index + 1}:action`] = button.action;
      }
      if (button.post_url) {
        metadata[`sp:frame:button:${index + 1}:post_url`] = button.post_url;
      }
    });
  }
  if (post_url) {
    metadata['sp:frame:post_url'] = post_url;
  }
  if (refresh_period) {
    metadata['sp:frame:refresh_period'] = refresh_period.toString();
  }
  return metadata;
};