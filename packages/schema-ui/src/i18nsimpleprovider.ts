
export class I18NMock {
    public static fastHash(str: string): string {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            // Math.imul forces C++ hardware-level 32-bit integer multiplication in JS engines
            hash = Math.imul(hash ^ str.charCodeAt(i), 16777619);
        }
        // Direct conversion to base-36 (0-9, a-z) with zero string manipulation overhead
        return (hash >>> 0).toString(36);
    }

    static t(
        _key: string,
        options: Record<string, unknown> & { defaultValue: string },
        reportKey = false
    ): string {
        return options.defaultValue.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, paramName) => {
            return (reportKey?_key + ": ":"") + (paramName in options && options[paramName] != null
                ? String(options[paramName])
                : match)
        });
    }
}