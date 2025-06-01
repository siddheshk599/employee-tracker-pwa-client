import Employee from './employee.model';

export default interface Attendance {
    _id?: string;
    empId: Employee | string;
    inTime: string;
    outTime?: string;
    punchInImg: string;
    punchOutImg?: string;
    punchInLocation: {
        latitude: number,
        longitude: number
    };
    punchOutLocation?: {
        latitude: number,
        longitude: number
    };
    punchInDoneBy: Employee | string;
    punchOutDoneBy?: Employee | string;
    status: string;
    locationHistory?: {
        latitude: number,
        longitude: number,
        createdAt: string
    }[]
};
