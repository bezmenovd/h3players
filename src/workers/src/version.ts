
export async function getHdModVersion(): Promise<number> {
    return new Promise(resolve => {
        fetch("https://heroes3hd.com/Update/Update.ini").then(r => r.text()).then(text => {
            let version = text.split(' ')[1]
            resolve(Number(version))
        })
    }) 
}
