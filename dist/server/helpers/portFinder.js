"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.portFinder = void 0;
const get_port_1 = __importDefault(require("get-port"));
exports.portFinder = (userPort) => __awaiter(void 0, void 0, void 0, function* () {
    const pp = [3000, 4000, 5000, 6000, 7000, 8000, 9000, 3030, 4040, 5050, 6060, 7070, 8080, 9090];
    const availablePort = yield get_port_1.default({ port: [userPort, ...pp], host: '127.0.0.1' });
    if (userPort !== availablePort) {
        console.log(`Port ${userPort} is not free. App will run on alternative free port.`);
    }
    return {
        port: availablePort,
        userRequested: userPort === availablePort,
    };
});
