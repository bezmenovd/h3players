import { bytesToHex } from './src/helpers/bytes'


const buffer = Buffer.alloc(4)
buffer.writeUInt32LE(5005392)

console.log(bytesToHex(buffer))

const buffer2 = Buffer.alloc(4)
buffer2.writeUInt32LE(3209)

console.log(bytesToHex(buffer2))

