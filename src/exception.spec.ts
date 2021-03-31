import 'jest';
import {
  ApiException,
  InvalidArgumentException,
  InvalidSyncIdException,
  NewSyncsForbiddenException,
  NewSyncsLimitExceededException,
  NotImplementedException,
  OriginNotPermittedException,
  RequestThrottledException,
  RequiredDataNotFoundException,
  SyncConflictException,
  SyncDataLimitExceededException,
  UnspecifiedException,
  UnsupportedVersionException,
} from './exception';

describe('Exception', () => {
  it('getResponseObject: should return exception reponse object', () => {
    const exception = new UnspecifiedException();
    const response = exception.getResponseObject();
    expect(response.code).toBeDefined();
    expect(response.message).toBeDefined();
  });

  it('InvalidArgumentException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new InvalidArgumentException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(InvalidArgumentException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
  });

  it('InvalidSyncIdException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new InvalidSyncIdException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(InvalidSyncIdException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('RequiredDataNotFoundException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new RequiredDataNotFoundException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(RequiredDataNotFoundException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('NewSyncsForbiddenException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new NewSyncsForbiddenException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(NewSyncsForbiddenException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('NewSyncsLimitExceededException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new NewSyncsLimitExceededException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(NewSyncsLimitExceededException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('NotImplementedException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new NotImplementedException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(NotImplementedException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('SyncConflictException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new SyncConflictException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(SyncConflictException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('UnsupportedVersionException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new UnsupportedVersionException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(UnsupportedVersionException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('SyncDataLimitExceededException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new SyncDataLimitExceededException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(SyncDataLimitExceededException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('RequestThrottledException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new RequestThrottledException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(RequestThrottledException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('OriginNotPermittedException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new OriginNotPermittedException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(OriginNotPermittedException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });

  it('UnspecifiedException should define properties', () => {
    let exception: ApiException;
    expect(() => {
      try {
        throw new UnspecifiedException();
      } catch (err) {
        exception = err;
        throw err;
      }
    }).toThrow(UnspecifiedException);
    expect(typeof exception.message).toBe('string');
    expect(typeof exception.name).toBe('string');
    expect(typeof exception.status).toBe('number');
  });
});
