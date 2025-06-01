import Employee from './employee.model';

export default interface SalaryAdvance {
    _id?: string;
    empId: Employee | string;
    advanceAmount: number;
    advanceDate: string;
    reason: string;
    status: string;
    decisionBy?: Employee | string;
}
