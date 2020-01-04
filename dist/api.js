"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./core/server");
// Entry point into server
const server = new server_1.default();
server.init().then(server.start);
//# sourceMappingURL=api.js.map