import { FrameRequest, FrameValidationData, FrameValidationResponse } from './types';
/**
 * Given a frame message, decode and validate it.
 *
 * // TODO: If message is valid, return the message. Otherwise undefined.
 *
 * @param body The JSON received by server on frame callback
 */
async function getFrameMessage(
  body: FrameRequest,
  // messageOptions?: FrameMessageOptions,
) 
: Promise<FrameValidationResponse>
{
  // TODO(viksit): add frame validation code here
  // Unvalidated
  const response: FrameValidationData = {
    button: body.untrustedData.buttonIndex,
    input: body.untrustedData.inputText,
    valid: true
  }
  return {
    isValid: true,
    message: response,
  };
  
}
export { getFrameMessage };