import axios from 'axios';

const clientId = process.env.SMS_DEPOT_CLIENT_ID!;
const apiSecret = process.env.SMS_DEPOT_API_SECRET!;

interface SendSmsRequest {
  to: string;
  message: string;
}

interface SmsResponse {
  messageId?: string;
  status: string;
  cost?: number;
}

export class SmsDepotService {
  private readonly baseUrl = 'https://rest.mymobileapi.com';

  private async authenticate(): Promise<string> {
    try {
      // Basic authentication
      const authString = `${clientId}:${apiSecret}`;
      const auth = btoa(authString);

      const response = await axios.post(
        `${this.baseUrl}/Authentication`,
        {},
        {
          headers: {
            Authorization: `${auth}`,
          },
        },
      );
      console.log('Authentication Response:', response.data);

      return response.data.token;
    } catch (error) {
      console.error('SMS Depot Authentication Error:', error);
      console.log(`Url: ${this.baseUrl}/Authentication`);
      throw new Error('Failed to authenticate with SMS Depot');
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.baseUrl}/sms/send`,
        {
          to,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('SMS sent to:', to);
      console.log('Response:', response.data);
      console.log('Response Status:', response.status);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid SMS Depot credentials');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`SMS sending failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async sendParentNotification(
    kidName: string,
    guardianContact: string,
    guardianName?: string,
  ): Promise<void> {
    const message = `Dear ${guardianName ? guardianName : 'parent/guardian'}, ${kidName} has been checked in successfully.`;
    await this.sendSms(guardianContact, message);
    console.log('SMS sent to:', guardianContact);
  }
}
