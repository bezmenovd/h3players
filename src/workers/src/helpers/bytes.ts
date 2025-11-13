import iconv from 'iconv-lite'


export function bytesToHex(buffer: Buffer, separator: string = ' ') : string {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(separator)
}

export function intToBytes(int: number): Buffer {
    let buffer = Buffer.alloc(4)
    buffer.writeInt32LE(int, 0)
    return buffer
}

export function hexDump(buffer: Buffer, bytesPerLine = 16) : string {
    const lines: string[] = [];

    for (let i = 0; i < buffer.length; i += bytesPerLine) {
        const slice = buffer.subarray(i, i + bytesPerLine);

        const hex = Array.from(slice)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');

        const ascii = bytesToStr(slice).replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '.');

        lines.push(`${hex.padEnd(bytesPerLine * 3)} | ${ascii}`);
    }

    return lines.join('\n')
}

export function bytesToStr(buffer: Buffer): string {
    return iconv.decode(buffer, 'windows-1251')
}

export function readstr(buffer: Buffer, start: number, max?: number): string {
    const end = buffer.indexOf(0, start)
    const sliceEnd = end === -1 ? (max ?? buffer.length) : end
    return bytesToStr(buffer.subarray(start, sliceEnd))
}

export function formatBytes(bytes: number, decimals = 0): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    return `${value.toFixed(dm)} ${sizes[i]}`;
}
