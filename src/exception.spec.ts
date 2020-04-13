// tslint:disable:no-unused-expression

import { assert, expect } from 'chai';
import 'mocha';
import { UnspecifiedException } from './exception';

describe('Exception', () => {
  it('should return exception object with correct properties', () => {
    const exception = new UnspecifiedException();
    expect(exception.message).to.equal('An unspecified error has occurred');
    expect(exception.name).to.equal('UnspecifiedException');
    expect(exception.status).to.equal(500);
  });

  it('getResponseObject: should return exception reponse object', () => {
    const exception = new UnspecifiedException();
    const response = exception.getResponseObject();
    expect(response.code).to.equal('UnspecifiedException');
    expect(response.message).to.equal('An unspecified error has occurred');
  });
});