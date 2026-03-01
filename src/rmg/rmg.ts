import fs from "node:fs"
import { createInterface } from "node:readline"
import { hexDump, intToBytes } from "./src/helpers/bytes"


// console.log(intToBytes(72));

let file = fs.readFileSync("./saves/Empty/GAME_BEGIN.GM2_unzipped")

fs.writeFileSync("output/rmg/111.gm2", hexDump(file, 24))


async function main() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    while (true) {
        rl.question('save path: ', (path) => {

        })
    }
}

main()

