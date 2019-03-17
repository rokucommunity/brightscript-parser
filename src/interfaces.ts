export interface Range {
    begin: Position;
    end: Position;
}
export interface Position {
    /**
     * The zero-based line value.
     */
    readonly line: number;

    /**
     * The zero-based character value.
     */
    readonly character: number;
}