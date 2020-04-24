"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const uuid = require("uuid");
const uuidParse = require("uuid-parse");
const exception_1 = require("./exception");
function convertBytesToUuidString(bytes) {
    if (!bytes) {
        return null;
    }
    if (!Buffer.isBuffer(bytes)) {
        throw new exception_1.InvalidArgumentException();
    }
    if (bytes.length !== 16) {
        throw new exception_1.InvalidArgumentException('Byte array not of the expected size');
    }
    return uuidParse.unparse(bytes).replace(/\-/g, '');
}
exports.convertBytesToUuidString = convertBytesToUuidString;
function convertUuidStringToBinary(uuidString) {
    if (!uuidString) {
        return null;
    }
    if (typeof uuidString !== 'string') {
        throw new exception_1.InvalidArgumentException();
    }
    let binary;
    try {
        const buffer = uuidParse.parse(uuidString);
        binary = new mongoose.Types.Buffer(buffer).toObject(0x04);
        if (this.convertBytesToUuidString(binary.buffer) !== uuidString.replace(/\-/g, '')) {
            throw new Error();
        }
    }
    catch (err) {
        throw new exception_1.InvalidSyncIdException('Argument is not a valid UUID string');
    }
    return binary;
}
exports.convertUuidStringToBinary = convertUuidStringToBinary;
function generateRandomUuid() {
    const buffer = uuid.v4(null, Buffer.alloc(16));
    return new mongoose.Types.Buffer(buffer).toObject(0x04);
}
exports.generateRandomUuid = generateRandomUuid;
//# sourceMappingURL=uuid.js.map