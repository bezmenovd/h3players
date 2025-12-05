export async function getHdModVersion(): Promise<number> {
    const parseVersion = (text: string): number => {
        const parts = text.trim().split(' ');
        const versionStr = parts.length > 1 ? parts[1] : '-';
        
        const versionNum = Number(versionStr);
        
        return Number.isFinite(versionNum) ? versionNum : 0; 
    };

    let version = 0

    try {
        const r1 = await fetch("https://heroes3hd.com/Update/Update.ini");
        const text1 = await r1.text();

        version = parseVersion(text1);
    } catch (e) {
        try {
            const r2 = await fetch("https://h3hota.com/HD/Update/Update.ini");
            const text2 = await r2.text();

            version = parseVersion(text2);
        } catch (e2) {
            throw new Error("failed to fetch HD Mod version");
        }
    }

    if (! (version > 5000000 && version < 9000000)) {
        throw new Error(`got invalid HD Mod version: ${version}`)
    }

    return version
}
