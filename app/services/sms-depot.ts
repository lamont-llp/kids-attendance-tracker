import axios from 'axios';

const apiKey = process.env.SMS_DEPOT_CLIENT_ID!;
const apiSecret = process.env.SMS_DEPOT_API_SECRET!;

interface SendSmsRequest {
  messages: Array<{
    content: string;
    destination: string;
  }>;
}

interface SmsResponse {
  messageId?: string;
  status: string;
  cost?: number;
}

export class SmsDepotService {
  private readonly baseUrl = 'https://rest.mymobileapi.com';


  private getAuthHeaders(): { headers: { Authorization: string; 'Content-Type': string } } {
    const credentials = `${apiKey}:${apiSecret}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    
    return {
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      const requestData: SendSmsRequest = {
        messages: [{
          content: message,
          destination: to
        }]
      };

      const response = await axios.post(
        `${this.baseUrl}/bulkmessages`,
        requestData,
        this.getAuthHeaders()
      );

      if (response.data) {
        console.log('Success:', response.data);
      }
    } catch (error: any) {
      if (error.response) {
        console.log('Failure:', error.response.data);
        throw new Error(error.response.data);
      } else {
        console.log('Something went wrong during the network request.');
        throw new Error('Network request failed');
      }
    }
  }

  async sendParentNotification(
    kidName: string,
    guardianContact: string,
    guardianName?: string,
  ): Promise<void> {
    const now = new Date();
    const dateTimeStr = now.toLocaleString('en-ZA', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
    const message = `Dear ${guardianName ? guardianName : 'parent/guardian'}, ${kidName} has been checked in successfully on ${dateTimeStr}.\nEOM Kids`;
    await this.sendSms(guardianContact, message);
    console.log('SMS sent to:', guardianContact);
  }
}
