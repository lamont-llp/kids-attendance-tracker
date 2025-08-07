import axios from 'axios';

interface SmsDepotConfig {
  clientId: string;
  apiSecret: string;
}

interface SendSmsRequest {
  to: string;
  message: string;
}

export class SmsDepotService {
  private readonly baseUrl = 'https://api.mymobileapi.com';

  constructor(private config: SmsDepotConfig) {}

  private async authenticate(): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const authString = `${this.config.clientId}:${this.config.apiSecret}`;
      const encoded = encoder.encode(authString);
      const auth = btoa(String.fromCharCode(...encoded));
      
      const response = await axios.post(
        `${this.baseUrl}/authentication`,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      
      return response.data.token;
    } catch (error) {
      console.error('SMS Depot Authentication Error:', error);
      throw new Error('Failed to authenticate with SMS Depot');
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      const token = await this.authenticate();
      
      await axios.post(
        `${this.baseUrl}/sms/send`,
        {
          to,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('SMS Depot Send Error:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendParentNotification(kidName: string, guardianContact: string, guardianName?: string): Promise<void> {
    const message = `Dear ${guardianName? guardianName : 'parent/guardian'}, ${kidName} has been checked in successfully.`;
    await this.sendSms(guardianContact, message);
    console.log('SMS sent to:', guardianContact);
  }
}
