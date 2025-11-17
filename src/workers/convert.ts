import { bytesToHex } from './src/helpers/bytes'


const buffer1 = Buffer.alloc(4)
buffer1.writeUInt32LE(parseInt(String(process.argv.pop())))

console.log(bytesToHex(buffer1))


