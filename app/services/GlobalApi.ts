// lib/GlobalApi.ts
import axios from 'axios';
import {ageGroup} from "@/utils/schema";

export interface AgeGroup {
    id: number;
    group: string;
}

export interface CreateKidRequest {
    name: string;
    age: string;
    address: string;
    contact: string;
}

const GetAllAgeGroups = () => axios.get('/api/ageGroup');

const CreateNewKid = (data: CreateKidRequest) => axios.post('/api/kid', data);

const GetAllKids = () => axios.get('/api/kid');

const DeleteKidRecord = (id: number) => axios.delete(`/api/kid?id=${id}`);

const GetAttendanceList = (ageGroup: string, month: any)=> axios.get(`/api/attendance?ageGroup=${ageGroup}&month=${month}`);

const MarkAttendance = (data: any) => axios.post('/api/attendance', data);

const MarkAbsent = (kidId: number, day: any, date: any) => axios.delete('/api/attendance?kidId='+kidId+'&day=' + day+'&date=' + date);

export default {
    GetAllAgeGroups,
    CreateNewKid,
    GetAllKids,
    DeleteKidRecord,
    GetAttendanceList,
    MarkAttendance,
    MarkAbsent,
};
