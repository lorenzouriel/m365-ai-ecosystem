import { InteractionLog } from '../knowledge/types';

/**
 * Mocks the Graph API call to upload a file to a SharePoint Document Library.
 * In production, this would use `@microsoft/microsoft-graph-client` to PUT to 
 * /sites/{site-id}/drive/items/{parent-id}:/{filename}:/content
 */
export async function uploadToSharePoint(filename: string, base64Content: string, siteId: string): Promise<string> {
  console.log(`[SharePoint] Uploading ${filename} to site ${siteId}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return a mock SharePoint sharing URL
  const mockUrl = `https://meridianadvisors.sharepoint.com/sites/KnowledgeBase/Shared%20Documents/${encodeURIComponent(filename)}`;
  console.log(`[SharePoint] Upload complete: ${mockUrl}`);
  
  return mockUrl;
}

/**
 * Mocks the Graph API call to send a message to a Microsoft Teams channel.
 * In production, this would POST to /teams/{team-id}/channels/{channel-id}/messages
 */
export async function sendTeamsNotification(channelId: string, message: string, log?: InteractionLog): Promise<void> {
  console.log(`[Teams] Sending notification to channel ${channelId}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let formattedMessage = message;
  if (log) {
    formattedMessage += `\n\n**Generated via AI Platform**\nTask: ${log.taskType}\nUser: ${log.userId}`;
  }

  console.log(`[Teams] Message Sent: \n${formattedMessage}`);
}
