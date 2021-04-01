import 'jest';
import { InvalidArgumentException, InvalidSyncIdException } from './exception';
import { convertBytesToUuidString, convertUuidStringToBinary, generateRandomUuid } from './uuid';

describe('UUID', () => {
  const testBytes = [52, 78, 238, 253, 60, 131, 78, 102, 155, 226, 241, 12, 69, 188, 89, 110];
  const testUuid = '344eeefd3c834e669be2f10c45bc596e';

  it('convertBytesToUuidString: should return a UUID from a given set of bytes', () => {
    const buffer = Buffer.from(testBytes);
    const uuid = convertBytesToUuidString(buffer);
    expect(typeof uuid).toBe('string');
    expect(uuid).not.toBeFalsy();
    expect(uuid).toStrictEqual(testUuid);
  });

  it('convertBytesToUuidString: should return null if supplied param is null', () => {
    const uuid = convertBytesToUuidString(null);
    expect(uuid).toBeNull();
  });

  it('convertBytesToUuidString: should throw InvalidArgumentException if supplied param is not a byte array', () => {
    expect(() => {
      convertBytesToUuidString('Not a byte array' as any);
    }).toThrow(InvalidArgumentException);
  });

  it('convertBytesToUuidString: should throw InvalidArgumentException if supplied byte array is wrong size', () => {
    expect(() => {
      const buffer = Buffer.from(testBytes.concat(testBytes));
      convertBytesToUuidString(buffer);
    }).toThrow(InvalidArgumentException);
  });

  it('convertUuidStringToBinary: should return a binary UUID from a given UUID string', () => {
    const binary = convertUuidStringToBinary(testUuid);
    expect(binary).not.toBeNull();
    expect(binary.buffer).toStrictEqual(Buffer.from(testBytes));
  });

  it('convertUuidStringToBinary: should return a version 4 binary UUID', () => {
    const binary = convertUuidStringToBinary(testUuid);
    expect(binary.sub_type).toBe(4);
  });

  it('convertUuidStringToBinary: should return null if supplied param is null', () => {
    const binary = convertUuidStringToBinary(null);
    expect(binary).toBeNull();
  });

  it('convertUuidStringToBinary: should throw InvalidArgumentException if supplied param is not a string', () => {
    expect(() => {
      convertUuidStringToBinary(1 as any);
    }).toThrow(InvalidArgumentException);
  });

  it('convertUuidStringToBinary: should throw InvalidSyncIdException if supplied param is not a valid UUID string', () => {
    expect(() => {
      convertUuidStringToBinary('Not a valid UUID string');
    }).toThrow(InvalidSyncIdException);
  });

  it('generateRandomUuid: should return a binary UUID with 16 bytes', () => {
    const binary = generateRandomUuid();
    expect(binary.buffer.length).toBe(16);
  });

  it('generateRandomUuid: should return a version 4 binary UUID', () => {
    const binary = generateRandomUuid();
    expect(binary.sub_type).toBe(4);
  });
});
