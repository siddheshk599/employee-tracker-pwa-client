import Company from './company.model';

export default interface CompanyBranch {
  _id?: string;
  companyId: Company | string;
  branchName: string;
  branchAddress: string;
  branchLocation: {
    latitude: number;
    longitude: number;
  };
}
