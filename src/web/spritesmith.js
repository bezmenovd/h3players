const spritesmith = require('spritesmith');
const fs = require('fs');
const path = require('path');

const ICON_CWD = path.resolve(__dirname, './public/img/h3/');
const OUTPUT_IMAGE_PATH = path.resolve(__dirname, './public/img/h3.png');
const OUTPUT_CSS_PATH = path.resolve(__dirname, './src/css/h3.css');

const CSS_IMAGE_REF = '/img/h3.png'; 


const glob = require('glob');
const files = glob.sync('{heroes/small/*.png,towns/*.png}', { cwd: ICON_CWD });
const srcPaths = files.map(file => path.resolve(ICON_CWD, file));

if (srcPaths.length === 0) {
    console.log('No PNG files found in the source directory.');
    process.exit(0);
}

spritesmith.run({
    src: srcPaths,
    algorithm: 'binary-tree',
    padding: 2,
}, function handleResult (err, result) {
    if (err) {
        throw err;
    }

    let css = `/* Сгенерировано Spritesmith. Не редактировать вручную. */\n\n`;
    
    const createClassName = (imagePath) => {
        const relativePath = path.relative(ICON_CWD, imagePath);
        return relativePath
            .replace(path.extname(relativePath), '')
            .replace(/\\|\//g, '-');
    };

    css += `
.h3 {
    background-image: url('${CSS_IMAGE_REF}');
    display: inline-block;
}
`;

    for (const imagePath in result.coordinates) {
        const coords = result.coordinates[imagePath];
        const className = createClassName(imagePath);

        css += `
.h3-${className.toLowerCase()} {
    width: ${coords.width}px;
    height: ${coords.height}px;
    background-position: -${coords.x}px -${coords.y}px;
}
`;
    }

    fs.writeFileSync(OUTPUT_IMAGE_PATH, result.image);
    fs.writeFileSync(OUTPUT_CSS_PATH, css);

    console.log(`png: ${OUTPUT_IMAGE_PATH}`);
    console.log(`css: ${OUTPUT_CSS_PATH}`);
});
