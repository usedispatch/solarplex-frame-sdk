import cheerio from "cheerio";
import { BASE_URL } from "./consts";
import axios from "axios";
export interface OgTags {
  [key: string]: string;
}

export class FrameParser {
  constructor() {}

  fetchPageContents = async (url: string): Promise<string> => {
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('Invalid URL: URL must start with http:// or https://')
    }
  
    try {
      const response = await axios.get(url)
      return response.data // Return the HTML content of the page
    } catch (error) {
      console.error('Failed to fetch page contents:', error)
      throw new Error('Failed to fetch page contents.')
    }
  }

  parseOgTagsFromPageContents = (html: string): OgTags => {
    const $ = cheerio.load(html);
    const tags: OgTags = {};

    $("meta").each((_, element) => {
      const property = $(element).attr("property") || $(element).attr("name");
      const content = $(element).attr("content");
      if (
        property &&
        content &&
        (property.startsWith("og:") || property.startsWith("sp:"))
      ) {
        tags[property] = content;
      }
    });

    return tags;
  };

  // NOTE: what type is fetchedMeta? or where is it currently defined
  createFrameFromOGTags = (
    fetchedMeta: OgTags,
    url: string,
    serviceUrl: string = BASE_URL
  ) => {
    const buttons = Object.keys(fetchedMeta)
      .filter((key) => key.startsWith("sp:frame:button:"))
      .map((key) => {
        const keyParts = key.split(":");
        const index = parseInt(keyParts[keyParts.length - 1], 10);
        return {
          index: index,
          label: fetchedMeta[key],
          action: "post", // default for now
        };
      })
      .sort((a, b) => a.index - b.index); // ensure buttons are in order

    // TODO(zfaizal2): strong typing everywhere
    // resuse the splx.defs types here
    const frameResponse = {
      result: {
        success: true,
        frame: {
          version: fetchedMeta["sp:frame"] || "vNext",
          image: this.proxyImage(fetchedMeta["sp:frame:image"] || "", serviceUrl),
          post_url: fetchedMeta["sp:frame:post_url"] || "",
          input: { text: fetchedMeta["sp:frame:input:text"] || "" },
          buttons: buttons,
          refresh_period: fetchedMeta["sp:frame:refresh_period"],
        },
        ogTags: {
          error: "",
          likely_type: fetchedMeta["sp:frame"] ? "frame" : "html",
          url: url,
          title: fetchedMeta["og:title"] || "",
          description: fetchedMeta["og:description"] || "",
          image: this.proxyImage(fetchedMeta["og:image"] || "", serviceUrl),
        },
      },
    };

    return frameResponse;
  };

  proxyImage = (imageUrl: string, baseUrl: string = BASE_URL) => {
    const proxiedImageUrl = `${baseUrl}/imgproxy?url=${encodeURIComponent(
      imageUrl
    )}`;
    return proxiedImageUrl;
  };
}
