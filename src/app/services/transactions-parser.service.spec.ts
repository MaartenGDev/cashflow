import { TestBed } from '@angular/core/testing';

import { TransactionsParserService } from './transactions-parser.service';

describe('TransactionsParserService', () => {
  let service: TransactionsParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionsParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
