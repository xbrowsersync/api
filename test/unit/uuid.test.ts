// tslint:disable:no-unused-expression

import * as Uuid from '../../src/core/uuid';
import { assert, expect } from 'chai';
import 'mocha';
import { InvalidArgumentException } from '../../src/core/exception';

describe('UUID', () => {
  const testBytes = [52, 78, 238, 253, 60, 131, 78, 102, 155, 226, 241, 12, 69, 188, 89, 110];
  const testUuid = '344eeefd3c834e669be2f10c45bc596e';

  it('convertBytesToUuidString: should return a UUID from a given set of bytes', () => {
    const buffer = Buffer.from(testBytes);
    const uuid = Uuid.convertBytesToUuidString(buffer);
    expect(uuid).to.be.a('string');
    expect(uuid).to.not.be.empty
    expect(uuid).to.equal(testUuid);
  });

  it('convertBytesToUuidString: should return null if supplied param is null', () => {
    const uuid = Uuid.convertBytesToUuidString(null);
    expect(uuid).to.be.null;
  });

  it('convertBytesToUuidString: should throw InvalidArgumentException if supplied param is not a byte array', () => {
    try {
      const uuid = Uuid.convertBytesToUuidString('Not a byte array' as any);
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(InvalidArgumentException);
      return;
    }

    assert.fail();
  });

  it('convertBytesToUuidString: should throw InvalidArgumentException if supplied byte array is wrong size', () => {
    try {
      const buffer = Buffer.from(testBytes.concat(testBytes));
      const uuid = Uuid.convertBytesToUuidString(buffer);
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(InvalidArgumentException);
      return;
    }

    assert.fail();
  });

  it('convertUuidStringToBinary: should return a binary UUID from a given UUID string', () => {
    const binary = Uuid.convertUuidStringToBinary(testUuid);
    expect(binary).to.not.be.null;
    expect(binary.buffer).to.eql(Buffer.from(testBytes));
  });

  it('convertUuidStringToBinary: should return a version 4 binary UUID', () => {
    const binary = Uuid.convertUuidStringToBinary(testUuid);
    expect(binary.sub_type).to.equal(4);
  });

  it('convertUuidStringToBinary: should return null if supplied param is null', () => {
    const binary = Uuid.convertUuidStringToBinary(null);
    expect(binary).to.be.null;
  });

  it('convertUuidStringToBinary: should throw InvalidArgumentException if supplied param is not a string', () => {
    try {
      const binary = Uuid.convertUuidStringToBinary(1 as any);
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(InvalidArgumentException);
      return;
    }

    assert.fail();
  });

  it('convertUuidStringToBinary: should throw InvalidArgumentException if supplied param is not a valid UUID string', () => {
    try {
      const binary = Uuid.convertUuidStringToBinary('Not a valid UUID string');
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(InvalidArgumentException);
      return;
    }

    assert.fail();
  });

  it('generateRandomUuid: should return a binary UUID with 16 bytes', () => {
    const binary = Uuid.generateRandomUuid();
    expect(binary.buffer.length).to.equal(16);
  });

  it('generateRandomUuid: should return a version 4 binary UUID', () => {
    const binary = Uuid.generateRandomUuid();
    expect(binary.sub_type).to.equal(4);
  });
});