import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditBranchesAndPositionsPage } from './edit-branches-and-positions.page';

describe('EditBranchesAndPositionsPage', () => {
  let component: EditBranchesAndPositionsPage;
  let fixture: ComponentFixture<EditBranchesAndPositionsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBranchesAndPositionsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditBranchesAndPositionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
