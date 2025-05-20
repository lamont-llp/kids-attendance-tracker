import {default as axios} from "axios";
import {NextResponse} from "next/server";

export interface CreateKidRequest {
    name: string;
    ageGroup: string;
    address: string;
    contact: string;
}

const GetAllAgeGroups = () => axios.get('/api/ageGroup');
const CreateNewKid = (data: Response) => axios.post('/api/kid', data);

export default { GetAllAgeGroups, CreateNewKid };