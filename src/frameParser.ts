import cheerio from "cheerio";
import { BASE_URL } from "./consts";
import axios from "axios";

export interface OgTags {
  [key: string]: string;
}

export interface Button {
  index: number;
  label: string;
  action: string;
  target?: string;
  post_url?: string;
  text?: string;
}
export class FrameParser {
  private proxyBaseUrl: string;
  
  constructor(proxyBaseUrl: string = BASE_URL) {
    this.proxyBaseUrl = proxyBaseUrl;
  }
  
  fetchPageContents = async (
    url: string, 
    customHeaders = {}, 
    queryParams = {}): Promise<string> => {
      const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
      };
      
      if (!/^https?:\/\//i.test(url)) {
        throw new Error('Invalid URL: URL must start with http:// or https://')
      }
    
      const headers = { ...defaultHeaders, ...customHeaders }

      try {
        const response = await axios.get(url, {
          params: queryParams, 
          headers: headers
        });
        return response.data; 
      } catch (error: any) {
        console.error(error);
        throw new Error(`Failed to fetch page contents: ${error.message}`);
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
          } else if (property === "post_url") {
            buttonInfo[index].post_url = fetchedMeta[key];
          } else if (property === "target") {
            buttonInfo[index].target = fetchedMeta[key];
          } else if (property === "text") {
            buttonInfo[index].text = fetchedMeta[key];
          }
        }
      });
      
      // convert the button info to an array of Button objects and sort them by index
      const buttons: Button[] = Object.values(buttonInfo).map(button => ({
        index: button.index,
        label: button.label,
        action: button.action,
        post_url: button.post_url,
        target: button.target,
        text: button.text
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
      