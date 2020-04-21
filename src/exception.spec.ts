import 'jest';
import * as Exception from './exception';

describe('Exception', () => {
  it('getResponseObject: should return exception reponse object', () => {
    const exception = new Exception.UnspecifiedException();
    const response = exception.getResponseObject();
    expect(response.code).toBeDefined();
    expect(response.message).toBeDefined();
  });

  it('InvalidArgumentException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.InvalidArgumentException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.InvalidArgumentException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
  });

  it('InvalidSyncIdException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.InvalidSyncIdException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.InvalidSyncIdException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('RequiredDataNotFoundException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.RequiredDataNotFoundException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.RequiredDataNotFoundException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('NewSyncsForbiddenException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.NewSyncsForbiddenException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.NewSyncsForbiddenException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('NewSyncsLimitExceededException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.NewSyncsLimitExceededException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.NewSyncsLimitExceededException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('NotImplementedException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.NotImplementedException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.NotImplementedException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('SyncConflictException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.SyncConflictException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.SyncConflictException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('UnsupportedVersionException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.UnsupportedVersionException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.UnsupportedVersionException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('SyncDataLimitExceededException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.SyncDataLimitExceededException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.SyncDataLimitExceededException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('RequestThrottledException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.RequestThrottledException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.RequestThrottledException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('OriginNotPermittedException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.OriginNotPermittedException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.OriginNotPermittedException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('UnspecifiedException should define properties', () => {
    let exception: Exception.ExceptionBase;
    expect(() => {
      try {
        throw new Exception.UnspecifiedException();
      }
      catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(Exception.UnspecifiedException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });
});