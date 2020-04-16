import 'jest';
import { UnspecifiedException } from './exception';

describe('Exception', () => {
  it('should return exception object with correct properties', () => {
    const exception = new UnspecifiedException();
    expect(exception.message).toBe('An unspecified error has occurred');
    expect(exception.name).toBe('UnspecifiedException');
    expect(exception.status).toBe(500);
  });

  it('getResponseObject: should return exception reponse object', () => {
    const exception = new UnspecifiedException();
    const response = exception.getResponseObject();
    expect(response.code).toBe('UnspecifiedException');
    expect(response.message).toBe('An unspecified error has occurred');
  });
});