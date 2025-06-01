import Employee from '../shared/models/employee.model';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { EmployeeService } from '../services/employee/employee.service';
import { NotificationService } from '../services/notification/notification.service';
import { secureStorage } from '../shared/storage';
import { constants } from '../shared/constants';
import { functions } from './../shared/functions';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.page.html',
  styleUrls: ['./employee.page.scss'],
})
export class EmployeePage {

  employees: Employee[];
  companies: any[] = [] = [];
  storageEmpPosition: string;
  storageEmpId: string;

  errorMsg;
  statusFilter: boolean = true;
  companyName: string;
  currentPage: number = 1;
  sharedFunctions = functions;

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private title: Title
  ) {}

  ionViewWillEnter(): void {
    this.title.setTitle(`Employee List - ${constants.appName}`);
    this.storageEmpPosition = secureStorage.getItem('position');
    this.storageEmpId = secureStorage.getItem('empId');
    this.getAllEmployeeDetails();
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.employees = undefined;
    this.currentPage = 1;
  }

  filterAndProcessEmployeeData(
    employees: Employee[],
    empPosition: string
  ): Employee[] {
    if (empPosition === 'admin') {
      employees = [...employees.filter((employee) => (employee._id != this.storageEmpId))];

    } else if (empPosition === 'company_admin') {
      this.employees = [...employees.filter(
        (employee) => (
          employee.position != 'admin' &&
          employee.position != 'company_admin'
        )
      )];

    } else if (empPosition === 'branch_manager') {
      this.employees = [...employees.filter(
        (employee) => (
          employee.position != 'admin' &&
          employee.position != 'company_admin' &&
          employee.position != 'branch_manager'
        )
      )];
    }

    return employees;
  }

  getAllEmployeeDetails(): void {
    this.errorMsg = undefined;

    if (this.storageEmpPosition === 'admin') {
      this.employeeService.getAllEmployeeDetails('?hasApproval=true')
      .subscribe(
        (employees) => {
          this.employees = this.filterAndProcessEmployeeData(employees, this.storageEmpPosition);
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting employee details.', 2000, 'top');
        }
      );
    } else if (this.storageEmpPosition === 'company_admin') {
      this.employeeService.getEmployeesByCompanyId(secureStorage.getItem('companyId'), '?hasApproval=true').subscribe(
        (employees) => {
          this.employees = this.filterAndProcessEmployeeData(employees, this.storageEmpPosition);
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting employee details.', 2000, 'top');
        }
      );
    } else if (this.storageEmpPosition === 'branch_manager') {
      this.employeeService.getEmployeesByBranchId(secureStorage.getItem('branchId'), '?hasApproval=true').subscribe(
        (employees) => {
          this.employees = this.filterAndProcessEmployeeData(employees, this.storageEmpPosition);
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting employee details.', 2000, 'top');
        }
      );
    }
  }

  navigateTo(routeName: string, data: any): void {
    this.router.navigateByUrl(routeName, {
      state: data
    });
  }

  getReport(pathName: string, data: any): void {
    this.router.navigateByUrl(pathName, {
      state: data
    });
  }

  showAlertForConfirmation(confirmationFor: string, index: number): void {
    let alert = this.notificationService.createAlert(
      `${
        (confirmationFor === 'statusChange') ? 'Confirm status update' : 'Confirm employee deletion'
      }`,
      `${
        (confirmationFor === 'statusChange') ?
        `Update status of employee '${this.employees[index].empName}' from '${
          (this.employees[index].isActive) ? 'active' : 'inactive'
        }' to '${
          (!this.employees[index].isActive) ? 'active' : 'inactive'
        }'?` :
        `Deleting an employee record will also delete all of it's records like attendances, salary advances, etc. Do you want to delete the employee '${this.employees[index].empName}'?`
      }`,
      [
        {
          text: 'NO',
          role: 'cancel'
        },
        {
          text: 'YES',
          handler: () => (
            (confirmationFor === 'statusChange') ? this.changeEmployeeActiveStatus(index) : this.deleteEmployee(index)
          )
        }
      ]
    );

    alert.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the alert:', error));
  }

  changeEmployeeActiveStatus(index: number): void {
    this.errorMsg = undefined;

    let currentActiveStatus = this.employees[index].isActive;

    let loader = this.notificationService.createLoader(`Updating the status of ${this.employees[index].empName}...`);

    loader.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the loader:", error));

    this.employeeService.updateEmployeeDetailsById(this.employees[index]._id, {
      isActive: !currentActiveStatus
    }).subscribe(
      (employee) => {
        this.employees[index].isActive = !currentActiveStatus;
        this.statusFilter = !currentActiveStatus;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing loader:", error));

        this.notificationService.showToast(`Active status of ${this.employees[index].empName} has been updated successfully.`, 2000, 'top');
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing loader:", error));

        this.notificationService.showErrorToast(`Error in updating the status of employee ${this.employees[index].empName}.`, 20000, 'top');
      }
    );
  }

  deleteEmployee(index: number): void {
    let loader = this.notificationService.createLoader(`Deleting employee '${this.employees[index].empName}'...`);

    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.employeeService.deleteEmployeeDetailsById(this.employees[index]._id).subscribe(
      (employee) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(`Employee details and records of '${this.employees[index].empName}' has been deleted successfully.`, 2000, 'top');

        this.employees.splice(index, 1);
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast(`Error in deleting the details of employee ${this.employees[index].empName}. Kindly try again.`, 2000, 'top');
      }
    );
  }

}
