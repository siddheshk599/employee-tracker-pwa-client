export const formErrors = {
  name: '',
  companyId: '',
  companyName: '',
  companyAddress: '',
  companyLatitude: '',
  companyLongitude: '',
  branchId: '',
  branchName: '',
  branchAddress: '',
  branchLatitude: '',
  branchLongitude: '',
  position: '',
  empId: '',
  empName: '',
  mobileNumber: '',
  workingDays: '',
  inTime: '',
  outTime: '',
  canPunchInOutAnywhere: '',
  salaryType: '',
  salaryAmount: '',    
  joiningDate: '',
  emailId: '',
  dob: '',
  address: '',
  bankAccNo: '',
  bankIfsc: '',
  aadhaar: '',
  pan: '',
  username: '',
  password: '',
  photoImg: '',
  fromDate: '',
  tillDate: '',
  leaveType: '',
  reason: '',
  advanceAmount: '',
  advanceDate: ''
};

export const validationMessages = {
  name: {
    minlength: 'Position Name should be at least of 3 characters long.',
    maxlength: 'Position Name must be at most of 20 characters long.',
    pattern: 'Enter a valid position name.',
    required: 'Position Name is required.'
  },
  companyId: {
    required: 'Please select a company.'
  },
  companyName: {
    required: 'Company Name is required.',
    minlength: 'Company Name should be at least of 5 characters long.',
    maxlength: 'Company Name must be at most of 50 characters long.',
    pattern: 'Enter a valid company name.'
  },
  companyAddress: {
    required: 'Company Address is required.',
    minlength: 'Company Address should be at least of 20 characters long.',
    maxlength: 'Company Address must be at most of 100 characters long.',
    pattern: 'Enter a valid company address.'
  },
  companyLatitude: {
    required: 'Latitude is required.'
  },
  companyLongitude: {
    required: 'Longitude is required.'
  },
  branchId: {
    required: 'Please select a company branch.'
  },
  branchName: {
    required: 'Branch Name is required.',
    minlength: 'Branch Name should be at least of 5 characters long.',
    maxlength: 'Branch Name must be at most of 50 characters long.',
    pattern: 'Enter a valid branch name.'
  },
  branchAddress: {
    required: 'Branch Address is required.',
    minlength: 'Branch Address should be at least of 20 characters long.',
    maxlength: 'Branch Address must be at most of 100 characters long.',
    pattern: 'Enter a valid branch address.'
  },
  branchLatitude: {
    required: 'Latitude is required.'
  },
  branchLongitude: {
    required: 'Longitude is required.'
  },
  position: {
    required: 'Position is required.'
  },
  empId: {
    required: 'Employee ID is required.',
    minlength: 'Employee ID should be at least 2 alphanumeric characters long',
    maxlength: 'Employee ID must be at most 7 alphanumeric characters long.',
    pattern: 'Enter a valid Employee ID.'
  },
  empName: {
    required: 'Employee Name is required.',
    minlength: 'Employee Name should be at least 2 characters long.',
    maxlength: 'Employee Name must be at most 25 characters long.',
    pattern: 'Employee Name must consist of only alphabets.'
  },
  mobileNumber: {
    required: 'Mobile No. is required.',
    minlength: 'Mobile No. must be 10 digits long.',
    maxlength: 'Mobile No. must be 10 digits long.',
    pattern: 'Mobile No. must consist of only digits.'
  },
  workingDays: {
    required: 'Working Days are required.',
    min: 'Minimum 1 day should be selected as working day.',
    max: 'Maximum 7 day(s) can be selected as working days.'
  },
  inTime: {
    required: 'In Time is required.',
    min: 'In Time should be after 9 AM.',
    max: 'In Time should be before 1 PM.'
  },
  outTime: {
    required: 'Out Time is required.',
    min: 'Out Time should be after 3 PM.',
    max: 'Out Time should be before 11 PM.'
  },
  canPunchInOutAnywhere: {
    required: 'Punch In Anywhere option is required.'
  },
  salaryType: {
    required: 'Salary Type is required.'
  },
  salaryAmount: {
    required: 'Salary is required.',
    min: 'Minimum salary must be more than or equal to Rs. 100.',
    max: 'Maximum salary must be less than or equal to Rs. 9999.',
    minlength: 'Salary should be of at least 3 digits.',
    maxlength: 'Salary must be at most of 4 digits.'
  },
  joiningDate: {
    pattern: 'Enter a valid joining date.'
  },
  emailId: {
    required: 'Email ID is required.',
    minlength: 'Email ID should be at least 6 characters long.',
    pattern: 'Enter a valid Email ID.'
  },
  dob: {
    pattern: 'Enter a valid Date of Birth.'
  },
  address: {
    minlength: 'Address should be at least 20 characters long.',
    maxlength: 'Address must be at most 100 characters long.',
    pattern: 'Enter a valid address.'
  },
  bankAccNo: {
    minlength: 'Bank Account No. should be at least of 10 digits.',
    maxlength: 'Bank Account No. must be at most of 20 digits.',
    pattern: 'Enter a valid Bank Account No.'
  },
  bankIfsc: {
    minlength: 'Bank IFSC is 11 alphanumeric characters long.',
    maxlength: 'Bank IFSC is 11 alphanumeric characters long.',
    pattern: 'Enter a valid Bank IFSC.'
  },
  aadhaar: {
    minlength: 'Aadhaar No. 12 digits long.',
    maxlength: 'Aadhaar No. 12 digits long.',
    pattern: 'Aadhaar No. must consist of only 12 digits.'
  },
  pan: {
    minlength: 'PAN No. must be 10 characters long.',
    maxlength: 'PAN No. must be 10 characters long.',
    pattern: 'PAN No. must consist of only alphabets and digits.'
  },
  username: {
    required: 'Username is required.',
    minlength: 'Username should bt at least of 2 characters.',
    maxlength: 'Username must be at most of 15 characters',
    pattern: 'Username must consist of only alphanumeric characters and symbols like _, ., -.'
  },
  password: {
    required: 'Password is required.'
  },
  fromDate: {
    required: 'From Date is required.'
  },
  tillDate: {
    required: 'Till Date is required.'
  },
  leaveType: {
    required: 'Leave Type is required.'
  },
  reason: {
    minlength: 'Reason should be at least of 10 characters long.',
    maxlength: 'Reason must bt at most of 50 characters long.',
    required: 'Reason is required.'
  },
  advanceAmount: {
    required: 'Advance Amount is required.',
    min: 'Minimum advance amount must be more than or equal to Rs. 100.',
    max: 'Maximum advance amount must be less than or equal to Rs. 9999.',
    minlength: 'Advance Amount should be of at least 3 digits.',
    maxlength: 'advance Amount must be at most of 4 digits.'
  },
  advanceDate: {
    required: 'Advance Date is required.'
  }
};