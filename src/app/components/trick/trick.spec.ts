import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trick } from './trick';

describe('Trick', () => {
  let component: Trick;
  let fixture: ComponentFixture<Trick>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trick]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Trick);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
