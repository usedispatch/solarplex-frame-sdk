import cheerio from "cheerio";
import { BASE_URL } from "./consts";
import axios from "axios";

export interface OgTags {
  [key: string]: string;
}

interface Button {
  index: number;
  label: string;
  action: string;
}
export class FrameParser {
  private proxyBaseUrl: string;
  
  constructor(proxyBaseUrl: string = BASE_URL) {
    this.proxyBaseUrl = proxyBaseUrl;
  }

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
  
  parseButtonsFromFetchedMeta = (fetchedMeta: OgTags) : Button[] => {
    const buttonInfo: Record<number, Button> = {};

    Object.keys(fetchedMeta).forEach(key => {
      if (key.startsWith("sp:frame:button:")) {
        const keyParts = key.split(":");
        const index = parseInt(keyParts[3], 10);
        const property = keyParts.length > 4 ? keyParts[4] : "label";

        if (!buttonInfo[index]) buttonInfo[index] = { index, label: "", action: "post" };
        if (property === "label") {
          buttonInfo[index].label = fetchedMeta[key];
        } else if (property === "action") {
          buttonInfo[index].action = fetchedMeta[key];
        }
      }
    });

    // convert the button info to an array of Button objects and sort them by index
    const buttons: Button[] = Object.values(buttonInfo).map(button => ({
      index: button.index,
      label: button.label,
      action: button.action,
    })).sort((a, b) => a.index - b.index);

    return buttons;
  }
  
  // NOTE: what type is fetchedMeta? or where is it currently defined
  createFrameFromOGTags = (
    fetchedMeta: OgTags,
    url: string,
    serviceUrl: string = this.proxyBaseUrl 
    ) => {
      
      // check if the url has frame tags
      // if not, we'll only return an empty frame
      const hasFrameTags = Object.keys(fetchedMeta).some(key => key.startsWith('sp:frame'));
      
      const buttons = this.parseButtonsFromFetchedMeta(fetchedMeta)
      
      // TODO(viksit): add frame validation here
      const frameResponse = hasFrameTags? {
        version: fetchedMeta["sp:frame"] || "vNext",
        image: this.proxyImage(fetchedMeta["sp:frame:image"] || "", serviceUrl),
        post_url: fetchedMeta["sp:frame:post_url"] || "",
        input: { text: fetchedMeta["sp:frame:input:text"] || "" },
        buttons: buttons,
        refresh_period: fetchedMeta["sp:frame:refresh_period"],
      } : {}
      
      const ogTagsResponse = {
        error: "",
        likely_type: fetchedMeta["sp:frame"] ? "frame" : "html",
        url: url,
        title: fetchedMeta["og:title"] || "",
        description: fetchedMeta["og:description"] || "",
        image: this.proxyImage(fetchedMeta["og:image"] || "", serviceUrl),
      }
      
      // TODO(zfaizal2): strong typing everywhere
      // reuse the splx.defs types here
      const response = {
        result: {
          success: true,
          isFrame: hasFrameTags,
          frame: frameResponse,
          ogTags: ogTagsResponse
        },
      };
      
      return response;
    };
    
    proxyImage = (imageUrl: string, baseUrl: string = this.proxyBaseUrl ) => {
      const proxiedImageUrl = `${baseUrl}/imgproxy?url=${encodeURIComponent(
        imageUrl
        )}`;
        return proxiedImageUrl;
      };
    }
    