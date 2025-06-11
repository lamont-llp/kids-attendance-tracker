export interface Attendance {
  id: number;
  kidId: number;
  name?: string;
  day: number;
  date: string;
  present: boolean;
}