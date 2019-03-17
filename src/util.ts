import { Range } from './interfaces';

export class Util {
    public createRange(startLineIndex: number, startColumnIndex: number, endLineIndex: number, endColumnIndex: number) {
        return {
            begin: {
                line: startLineIndex,
                character: startColumnIndex
            },
            end: {
                line: endLineIndex,
                character: endColumnIndex
            }
        } as Range;
    }
}
export let util = new Util();