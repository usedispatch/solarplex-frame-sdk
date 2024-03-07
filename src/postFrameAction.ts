import axios from "axios";
import { FrameParser } from "./frameParser";

export async function callPostFrameAction({
  frameActionIndex,
  framePostUrl,
  inputText,
  itemCid,
  itemUri,
  author,
  did,
  followsAuthor,
  linkedWallet,
  connectedWallet,
  likedPost,
  repostedPost,
  txnSignature,
  ctx,
}) {
  const requestBody = {
    untrustedData: {
      buttonIndex: frameActionIndex,
      inputText: inputText ?? '',
      url: framePostUrl,
      itemUri: itemUri,
      itemCid: itemCid,
      author: author,
      did: did,
      followsAuthor: followsAuthor,
      linkedWallet: linkedWallet,
      connectedWallet: connectedWallet,
      likedPost: likedPost,
      repostedPost: repostedPost,
      txnSignature: txnSignature ?? '',
    },
  };

  try {
    const frameParser = new FrameParser();


    const response = await axios.post(framePostUrl, requestBody, {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const finalUrl = response.headers.location;
      return {
        encoding: 'application/json',
        body: {
          result: {
            success: true,
            isFrame: false,
            isRedirect: true,
            redirectUrl: finalUrl,
            redirectStatus: response.status,
            frame: {},
            ogTags: {},
          },
        },
      };
    } else {
      const fetchedMeta = frameParser.parseOgTagsFromPageContents(response.data);
      const frameResponse = frameParser.createFrameFromOGTags(fetchedMeta, framePostUrl, ctx.cfg.publicUrl);
      return {
        encoding: 'application/json',
        body: frameResponse,
      };
    }
  } catch (error: any) {
    console.error('Error making frame call:', error.message);
    throw new Error('Failed to make frame call');
  }
}