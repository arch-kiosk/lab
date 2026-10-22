// i18next.config.js
export default {
    locales: ['en', 'de', 'ar'],
    extract: {
        output: 'src/locales/{{language}}/{{namespace}}.json',
        input: ['src/**/*.{ts,js,html}'],
        // defaultValue: (lng, ns, key, options) => options.defaultValue || '',
        functions: ['i18NST','*.i18NST','*.i18NT'],

        // Tell the parser how to extract the default value when the 2nd argument is a string literal
        defaultValue: (lng, ns, key, options) => {
            // When called as i18NST(key, "default text", ...), 'options' receives the string
            if (typeof options === 'string') {
                return options;
            }
            return options?.defaultValue || '';
        },
    },
    keySeparator: false,
    namespaceSeparator: false,
};