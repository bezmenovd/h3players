import { bytesToHex } from './src/helpers/bytes'


const buffer1 = Buffer.alloc(4)
buffer1.writeUInt32LE(816280020)

console.log(bytesToHex(buffer1))

const buffer2 = Buffer.alloc(4)
buffer2.writeUInt32LE(1762964820)

console.log(bytesToHex(buffer2))

