import { bytesToHex } from './src/helpers/bytes'


const buffer = Buffer.alloc(4)
buffer.writeUInt32LE(5034)

console.log(bytesToHex(buffer))

