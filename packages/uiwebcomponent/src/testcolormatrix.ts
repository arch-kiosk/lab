// @ts-nocheck

import { html } from 'lit'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import colorMatrixHtml from './color-matrix-l0.html?raw'

export function renderColorMatrix() {
    return html`${unsafeHTML(colorMatrixHtml)}`
}
 export function buildColorMatrix() {
    // Each purpose has a base background and its light/dark variants.
    const backgrounds = [
        { key: "bg", label: "bg", vars: ["--col-bg-lt", "--col-bg", "--col-bg-dk"] },
        { key: "bg-button", label: "bg-button", vars: ["--col-bg-button-lt", "--col-bg-button", "--col-bg-button-dk"] },
        { key: "bg-input", label: "bg-input", vars: ["--col-bg-input-lt", "--col-bg-input", "--col-bg-input-dk"] },
        { key: "bg-ack", label: "bg-ack", vars: ["--col-bg-ack-lt", "--col-bg-ack", "--col-bg-ack-dk"] },
        { key: "bg-warn", label: "bg-warn", vars: ["--col-bg-warn-lt", "--col-bg-warn", "--col-bg-warn-dk"] },
        { key: "bg-alert", label: "bg-alert", vars: ["--col-bg-alert-lt", "--col-bg-alert", "--col-bg-alert-dk"] }
    ];

    const foregroundRows = [
        {
            label: "primary",
            vars: {
                "bg": ["--col-primary", "--col-primary", "--col-primary"],
                "bg-button": ["--col-primary-button", "--col-primary-button", "--col-primary-button"],
                "bg-input": ["--col-primary-input", "--col-primary-input", "--col-primary-input"],
                "bg-ack": ["--col-primary-ack", "--col-primary-ack", "--col-primary-ack"],
                "bg-warn": ["--col-primary-warn", "--col-primary-warn", "--col-primary-warn"],
                "bg-alert": ["--col-primary-alert", "--col-primary-alert", "--col-primary-alert"]
            }
        },
        {
            label: "accent",
            vars: {
                "bg": ["--col-accent", "--col-accent", "--col-accent"],
                "bg-button": ["--col-accent-button", "--col-accent-button", "--col-accent-button"],
                "bg-input": ["--col-accent-input", "--col-accent-input", "--col-accent-input"],
                "bg-ack": ["--col-accent-ack", "--col-accent-ack", "--col-accent-ack"],
                "bg-warn": ["--col-accent-warn", "--col-accent-warn", "--col-accent-warn"],
                "bg-alert": ["--col-accent-alert", "--col-accent-alert", "--col-accent-alert"]
            }
        },
        {
            label: "ack",
            vars: {
                "bg-button": ["--col-ack-button", "--col-ack-button", "--col-ack-button"],
            }
        },
        {
            label: "warn",
            vars: {
                "bg-button": ["--col-warn-button", "--col-warn-button", "--col-warn-button"],
            }
        },
        {
            label: "alert",
            vars: {
                "bg-button": ["--col-alert-button", "--col-alert-button", "--col-alert-button"],
            }
        }
    ];

    const borderRows = [
        { label: "lt", prefix: "--col-bd-lt", suffix: "lt" },
        { label: "dk", prefix: "--col-bd-dk", suffix: "dk" }
    ];

    const borderVar = (row, bg) => {
        if (bg === "bg") return row.prefix;
        return `${row.prefix}-${bg.replace(/^bg-/, "")}`;
    };

    const makeCell = (tag, text, className) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        el.textContent = text;
        return el;
    };

    const addBackgroundHeaders = (thead) => {
        const groupRow = document.createElement("tr");
        const corner = makeCell("th", "", "corner");
        corner.rowSpan = 2;
        groupRow.appendChild(corner);

        for (const bg of backgrounds) {
            const th = makeCell("th", bg.label, "purpose");
            th.colSpan = 3;
            const base = `var(--col-${bg.key})`
            th.style.backgroundColor = base;
            th.style.color = `contrast-color(${base})`;
            groupRow.appendChild(th);
        }
        thead.appendChild(groupRow);

        const variantRow = document.createElement("tr");
        for (const bg of backgrounds) {
            for (const variant of ["lt", "base", "dk"]) {
                const th = makeCell("th", variant === "base"?"":variant, "variant");
                const varName = variant === "base"
                    ? `--col-${bg.key}`
                    : `--col-${bg.key}-${variant}`;
                th.style.backgroundColor = `var(${varName})`
                th.style.color = `contrast-color(var(${varName}))`
                th.title = varName;
                variantRow.appendChild(th);
            }
        }
        thead.appendChild(variantRow);
    };

    const addSampleCell = (row, bg, index, foregroundVar) => {
        const td = document.createElement("td");
        td.className = "sample";

        const bgVar = bg.vars[index];

        if (foregroundVar) {
            td.style.backgroundColor = `var(${bgVar})`
            td.style.color = foregroundVar ? `var(${foregroundVar})` : `contrast-color(var(${bgVar}))`
            const name = makeCell("span", `${foregroundVar}`, "var-name");
            td.appendChild(name);
        } else {
            td.style.color = `contrast-color(var(${bgVar}))`;
            td.style.borderColor = 'white'
            td.appendChild(makeCell("span", "-", "missing"));
            td.title = `No defined combination for ${bgVar}`;
        }
        row.appendChild(td);
    };

    const addForegroundSection = (tbody) => {
        const section = document.createElement("tr");
        section.className = "section-row";
        const th = makeCell("th", "Foreground combinations");
        th.colSpan = 19;
        section.appendChild(th);
        tbody.appendChild(section);

        for (const fg of foregroundRows) {
            const tr = document.createElement("tr");
            tr.appendChild(makeCell("th", fg.label, "row-label"));
            for (const bg of backgrounds) {
                for (let i = 0; i < 3; i++) {
                    const vars = fg.vars[bg.key];
                    addSampleCell(tr, bg, i, vars ? vars[i] : null);
                }
            }
            tbody.appendChild(tr);
        }
    };

    const addBorderSection = (tbody) => {
        const section = document.createElement("tr");
        section.className = "section-row";
        const th = makeCell("th", "Border variants");
        th.colSpan = 19;
        section.appendChild(th);
        tbody.appendChild(section);

        for (const border of borderRows) {
            const tr = document.createElement("tr");
            tr.appendChild(makeCell("th", border.label, "row-label"));

            for (const bg of backgrounds) {
                for (let i = 0; i < 3; i++) {
                    const td = document.createElement("td");
                    td.className = "sample";
                    td.style.maxWidth = "3em"
                    const bgColor = "--col-bg";
                    const borderVariable = borderVar(border, bg.key);
                    const borderColor = borderVariable;
                    td.style.backgroundColor = `var(${bgColor})`;
                    td.style.color = `black`;
                    td.style.border = `3px solid var(${borderColor}, "#888"`;
                    td.appendChild(makeCell("span", borderVariable, "var-name"));
                    td.title = `${borderVariable}`;
                    tr.appendChild(td);
                }
            }
            tbody.appendChild(tr);
        }
    };

    // Target the table element inside Lit's Shadow DOM
    const table = this.renderRoot.querySelector("#color-matrix");
    if (!table) return;

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    addBackgroundHeaders(thead);
    addForegroundSection(tbody);
    addBorderSection(tbody);

    table.replaceChildren(thead, tbody);
}
