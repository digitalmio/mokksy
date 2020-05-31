"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
exports.wait = (amount = 0) => new Promise((resolve) => setTimeout(resolve, amount));
