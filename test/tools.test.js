// noinspection DuplicatedCode

import {replaceData} from "../src/tools";

test("replace a single variable", () => {
    expect(replaceData("${e1}", {})).toBe("");
    expect(replaceData("${e1}", {"e1": ""})).toBe("");
    expect(replaceData("${e1}", {"e1": "value"})).toBe("value");
});

test("replace a few variables", () => {
    expect(replaceData("Some text with some ${e1} and some more ${e1}", {"e1": "variables"})).toBe("Some text with some variables and some more variables");
    expect(replaceData("Some text with some ${e1} and some ${e2}", {"e1": "variables", "e2": "other variables"})).toBe("Some text with some variables and some other variables");
    expect(replaceData("Some text with some ${e1} and some ${e2} and no more ${e3}", {"e1": "variables", "e2": "other variables"})).toBe("Some text with some variables and some other variables and no more ");
});
