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
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new genai_1.GoogleGenAI({ apiKey: "AIzaSyCm-_oseO2HwlI_RUiCFHVDHUGcEA_maK0" });
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Give the name,symbol,address,decimals of the token  on solana in key value format",
        });
        console.log(response.text);
    });
}
main();
