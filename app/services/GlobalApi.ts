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

export default {
    GetAllAgeGroups,
    CreateNewKid,
    GetAllKids,
    DeleteKidRecord,
    GetAttendanceList,
};
