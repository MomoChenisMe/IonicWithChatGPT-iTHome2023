import { TestBed } from '@angular/core/testing';

import { SqlitedbService } from './sqlitedb.service';

describe('SqlitedbService', () => {
  let service: SqlitedbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlitedbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
