"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
// Entry point into server
exports.default = (async () => {
    const app = await server_1.createApplication();
    await server_1.startService(app);
})();
