import Employee from './employee.model';

export default interface Leave {
    _id?: string;
    empId: Employee | string;
    fromDate: string;
    tillDate: string;
    leaveType: string;
    reason: string;
    status: string;
    decisionBy?: Employee | string;
};
