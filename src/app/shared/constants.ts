import { environment } from '../../environments/environment';

export const constants = {
  apiBaseURL: environment.apiBaseURL,
  appName: environment.appName,
  googleMapsQueryURL: `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsAPIKey}&q=`,
  indiaMapURL: `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsAPIKey}&q=india`,
  months: [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ],
  salaryTypes: ['Daily', 'Hourly', 'Weekly'],
  weekDays: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  employeeSearchFields: [
    {
      displayName: 'Company Name',
      fieldName: 'companyName',
    },
    {
      displayName: 'Branch Name',
      fieldName: 'branchName',
    },
    {
      displayName: 'Position',
      fieldName: 'position',
    },
    {
      displayName: 'Employee ID',
      fieldName: 'empId',
    },
    {
      displayName: 'Employee Name',
      fieldName: 'empName',
    },
    {
      displayName: 'Mobile Number',
      fieldName: 'mobileNumber',
    },
    {
      displayName: 'Salary Type',
      fieldName: 'salaryType',
    },
  ],
};
