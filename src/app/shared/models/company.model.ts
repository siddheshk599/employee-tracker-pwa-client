import CompanyBranch from "./company-branch.model";

export default interface Company {
    _id?: string;
    companyName: string;
    companyAddress: string;
    companyLocation: {
        latitude: number,
        longitude: number
    };
    positions: string[];
    branches?: CompanyBranch[] | string[] | any[];
}
