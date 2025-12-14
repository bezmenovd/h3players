
export async function loadImg(url: string) {
    return new Promise<void>(async (resolve) => {
        let img = new Image()
        img.src = url
        img.onload = (e) => resolve()
    })
}

export type Font = {
    name: string
    url: string
    format: 'woff' | 'woff2' | 'ttf' | 'otf'
    unicodeRange: string
}

export async function loadFont(font: Font) {
    return new Promise<void>(async (resolve) => {
        let fontFace = new FontFace(
            font.name,
            `url('${font.url}') format('${font.format}')`,
            { weight: '100 900', unicodeRange: font.unicodeRange }
        )

        fontFace.load().then((loadedFont) => {
            document.fonts.add(loadedFont)
            resolve()
        })
    })
}

export async function preload(objects: (string | Font)[]) {
    await Promise.all(objects.map(object => {
        if (typeof object === 'string') {
            return loadImg(object)
        } else {
            return loadFont(object)
        }
    }))
}
