import * as mongoose from 'mongoose';
import * as uuid from 'uuid';
import * as uuidParse from 'uuid-parse';
import { Binary } from 'mongodb';
import { InvalidArgumentException, InvalidSyncIdException } from './exception';

export function convertBytesToUuidString(bytes: Buffer): string {
  if (!bytes) {
    return null;
  }

  if (!Buffer.isBuffer(bytes)) {
    throw new InvalidArgumentException();
  }

  if (bytes.length !== 16) {
    throw new InvalidArgumentException('Byte array not of the expected size');
  }

  return uuidParse.unparse(bytes).replace(/\-/g, '');
}

export function convertUuidStringToBinary(uuidString: string): Binary {
  if (!uuidString) {
    return null;
  }

  if (typeof uuidString !== 'string') {
    throw new InvalidArgumentException();
  }

  let binary: Binary;
  try {
    const buffer = uuidParse.parse(uuidString);
    binary = new mongoose.Types.Buffer(buffer).toObject(0x04);
    if (this.convertBytesToUuidString(binary.buffer) !== uuidString.replace(/\-/g, '')) {
      throw new Error();
    }
  }
  catch (err) {
    throw new InvalidSyncIdException('Argument is not a valid UUID string');
  }

  return binary;
}

export function generateRandomUuid(): Binary {
  const buffer = uuid.v4(null, Buffer.alloc(16));
  return new mongoose.Types.Buffer(buffer).toObject(0x04);
}