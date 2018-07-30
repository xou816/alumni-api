import {Encoder} from "crypto-js";

export interface WordArray {
    words: number[];
    sigBytes: number;
    init(words?: number[], sigBytes?: number): void;
    toString(encoder?: Encoder): string;
    concat(wordArray: WordArray): WordArray;
    clamp(): void;
    clone(): WordArray;
    random(nBytes: number): WordArray;
}