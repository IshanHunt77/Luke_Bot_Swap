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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndStoreTokens = exports.tokens = void 0;
const stream_1 = require("stream");
// @ts-ignore if needed for TS
const stream_json_1 = require("stream-json");
const StreamArray_1 = require("stream-json/streamers/StreamArray");
const stream_chain_1 = require("stream-chain");
const prisma_1 = __importDefault(require("./prisma"));
const getTokenFromDb = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield prisma_1.default.token.findFirst({
            where: { symbol }
        });
        if (token) {
            exports.tokens.set(symbol, {
                symbol: token.symbol,
                name: token.name,
                address: token.address,
                decimals: token.decimals
            });
        }
    }
    catch (e) {
        console.log("Error:", e);
    }
});
exports.tokens = new Map();
const fetchAndStoreTokens = (symbol1, symbol2) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    yield getTokenFromDb(symbol1);
    yield getTokenFromDb(symbol2);
    if (exports.tokens.size == 2) {
        return;
    }
    const res = yield fetch("https://lite-api.jup.ag/tokens/v1/all");
    if (!res.ok || !res.body) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    const nodeStream = stream_1.Readable.fromWeb(res.body);
    const chainStream = (0, stream_chain_1.chain)([
        nodeStream,
        (0, stream_json_1.parser)(),
        (0, StreamArray_1.streamArray)()
    ]);
    let found = 0;
    try {
        for (var _d = true, chainStream_1 = __asyncValues(chainStream), chainStream_1_1; chainStream_1_1 = yield chainStream_1.next(), _a = chainStream_1_1.done, !_a; _d = true) {
            _c = chainStream_1_1.value;
            _d = false;
            const { value } = _c;
            const { symbol, name, address, decimals } = value;
            if (!symbol || !name || !address || decimals === undefined)
                continue;
            if (symbol === symbol1 || symbol === symbol2) {
                exports.tokens.set(symbol, { symbol, name, address, decimals });
                console.log("Parsed token:", symbol);
                found++;
                yield prisma_1.default.token.create({
                    data: {
                        symbol,
                        name,
                        address,
                        decimals
                    }
                });
            }
            if (found === 2) {
                console.log("destroying");
                // Manually stop the stream
                chainStream.destroy(); // 👈 this prevents the abort error
                break;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = chainStream_1.return)) yield _b.call(chainStream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log("✅ Token import completed.");
    console.log(exports.tokens.get(symbol1));
});
exports.fetchAndStoreTokens = fetchAndStoreTokens;
// fetchAndStoreTokens().catch(err => {
//   console.error("❌ Fetch/store failed:", err);
// });
