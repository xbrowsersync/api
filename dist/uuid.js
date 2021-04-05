"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomUuid = exports.convertUuidStringToBinary = exports.convertBytesToUuidString = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid = __importStar(require("uuid"));
const uuid_parse_1 = __importDefault(require("uuid-parse"));
const exception_1 = require("./exception");
const convertBytesToUuidString = (bytes) => {
    if (!bytes) {
        return null;
    }
    if (!Buffer.isBuffer(bytes)) {
        throw new exception_1.InvalidArgumentException();
    }
    if (bytes.length !== 16) {
        throw new exception_1.InvalidArgumentException('Byte array not of the expected size');
    }
    return uuid_parse_1.default.unparse(bytes).replace(/-/g, '');
};
exports.convertBytesToUuidString = convertBytesToUuidString;
const convertUuidStringToBinary = (uuidString) => {
    if (!uuidString) {
        return null;
    }
    if (typeof uuidString !== 'string') {
        throw new exception_1.InvalidArgumentException();
    }
    let binary;
    try {
        const buffer = uuid_parse_1.default.parse(uuidString);
        binary = new mongoose_1.default.Types.Buffer(buffer).toObject(0x04);
        if (exports.convertBytesToUuidString(binary.buffer) !== uuidString.replace(/-/g, '')) {
            throw new Error();
        }
    }
    catch (err) {
        throw new exception_1.InvalidSyncIdException('Argument is not a valid UUID string');
    }
    return binary;
};
exports.convertUuidStringToBinary = convertUuidStringToBinary;
const generateRandomUuid = () => {
    const buffer = uuid.v4(null, Buffer.alloc(16));
    return new mongoose_1.default.Types.Buffer(buffer).toObject(0x04);
};
exports.generateRandomUuid = generateRandomUuid;
