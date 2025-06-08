import Employee from './employee.model';

export default interface Chat {
    _id?: string;
    senderEmpId: Employee | string;
    receiverEmpId: Employee | string;
    message: string;
    createdAt?: string;
}
