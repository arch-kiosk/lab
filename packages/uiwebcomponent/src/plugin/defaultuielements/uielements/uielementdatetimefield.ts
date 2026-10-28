import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import "@vaadin/date-picker"
import "@vaadin/date-time-picker"

import {
    UISchemaDateTimeField,
} from '#src/uischema'
import { UIElementRenderContext } from '#src/uielementrendercontext'
import {
    ApiTimeZoneInfo,
    TemplateResultOrNothing,
    UIElementDataChangedEvent,
} from '#src/sharedtypes'
import { getLatinDate } from '#src/tools'
import { DateTime } from 'luxon'
import { DateTimePicker } from '@vaadin/date-time-picker'
import { DatePicker } from '@vaadin/date-picker'
import type { DateTimePickerI18n } from '@vaadin/date-time-picker';

export class UIElementDateTimeField extends UIElement {

    static createDatePickerI18n(locale: string): Partial<DateTimePickerI18n> {
        return {
            formatDate: ({ year, month, day }) =>
                DateTime.local(year, month + 1, day)
                    .setLocale(locale)
                    .toLocaleString(DateTime.DATE_SHORT),

            parseDate: (text) => {
                const dt = DateTime.fromFormat(text, 'D', { locale });

                return dt.isValid
                    ? {
                        year: dt.year,
                        month: dt.month - 1,
                        day: dt.day
                    }
                    : undefined;
            }
        };
    }

    static latinCustomI18n: Partial<DateTimePickerI18n> = {
        formatDate: ({ year, month, day }) => {
            return getLatinDate(DateTime.local(year, month + 1, day), false)

        },
        parseDate: (text) => {
            if (!text) return undefined;

            // Map Roman numerals to Vaadin's 0-indexed month integers (0 = Jan, 11 = Dec)
            const romanMonths: Record<string, number> = {
                "I": 0, "II": 1, "III": 2, "IV": 3, "V": 4, "VI": 5,
                "VII": 6, "VIII": 7, "IX": 8, "X": 9, "XI": 10, "XII": 11
            };

            // Expecting format "DD.MM.YYYY" (e.g., "29.XI.2017")
            const [dayStr, monthRoman, yearStr] = text.trim().split('.');

            const day = parseInt(dayStr, 10);
            const year = parseInt(yearStr, 10);
            const month = romanMonths[monthRoman?.toUpperCase()];

            if (month === undefined || isNaN(day) || isNaN(year)) {
                return undefined;
            }

            return { year, month, day };
        },
        formatTime: (timeParts) => {
            if (!timeParts) return '';
            const dt = DateTime.fromObject({
                hour: parseInt(String(timeParts.hours), 10),
                minute: parseInt(String(timeParts.minutes), 10),
                second: parseInt(String(timeParts.seconds|| 0), 10)
            });

            // Automatically format according to browser locale
            return dt.toLocaleString(DateTime.TIME_WITH_SECONDS);
        }
    };

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id, true)
    }

    static checkElementDefinition(id: string, context: UIElementRenderContext): UISchemaDateTimeField {
        if (!context.parentLayout)
            throw context.uicomponent.i18NST('uic.missing_parent_layout', '{{ui_element_name}}: render context is missing parentLayout', [id])
        if (context.elementDefinition.element_type !== 'date_time_field')
            throw context.uicomponent.i18NST('uic.wrong_element_type', '{{ui_element_name}}: render called with wrong element type {{element_type}}', [id, context.elementDefinition.element_type])

        return context.elementDefinition
    }

    static getValidationInfo(context: UIElementRenderContext, id: string) {
        const validationInfo = {
            hasError: false,
            results: context.getFieldValidationInfo(id),
        }
        validationInfo.hasError = Boolean(
            validationInfo.results
            && validationInfo.results.find((v) => v.result === 'error'),
        )
        return validationInfo
    }

    static onDataChanged(e:CustomEvent) {
        const newValue = e.detail.value;
        const element = e.currentTarget as (DateTimePicker & DatePicker)
        e.stopPropagation()
        try {
            const oldValue = element.getAttribute('value')
            if (newValue !== oldValue) {
                console.log(`new value for ${element.id} is`, newValue, ' old value was ', oldValue)
                if (newValue) {
                    element.setAttribute('value', newValue);
                } else {
                    element.setAttribute('value', newValue);
                }
                element.dispatchEvent(new UIElementDataChangedEvent({
                        id: element.id,
                        value: newValue}
                ));
            }
        } catch(e) {
            console.error(`UIElementDateTimeField.onValueChanged throew exception ${e} in event ${{ ...e }}`, )
        }
    }
    static renderElement(context: UIElementRenderContext, id: string, skeleton = false): TemplateResultOrNothing {

        /* ============================================
           First of all: prepare what is needed for the rendering part
           ============================================ */

        const elementDefinition = this.checkElementDefinition(id, context)
        const parentLayout = context.parentLayout!

        let [value, text] = this.batchResolve(
            context,
            [elementDefinition.value, elementDefinition.text],
            id
        ) as [string | undefined, string]

        const tsAndTimeZoneIndex = value?.split('@')
        const tsWithoutTimeZoneIndex = tsAndTimeZoneIndex ? tsAndTimeZoneIndex[0] : ''
        let timeZoneInfo: ApiTimeZoneInfo | undefined = undefined
        if (tsAndTimeZoneIndex && tsAndTimeZoneIndex[1] && tsAndTimeZoneIndex[1] !== '-') {
            timeZoneInfo = this.getTimeZoneInfo(context, parseInt(tsAndTimeZoneIndex[1]))
        }
        const includeTime = elementDefinition.include_time === undefined
            ?true
            :elementDefinition.include_time

        let ts = DateTime.fromISO(tsWithoutTimeZoneIndex, { zone: 'utc', setZone: true })
        let displayValue: string | undefined = undefined
        if (ts.isValid) {
            // console.log(`${id} ts is valid and is: ${value}`)
            ts = ts.set({millisecond: 0})
            if (timeZoneInfo) ts = ts.setZone(timeZoneInfo.tz_IANA)
            if ((elementDefinition.date_format ?? '') === 'latin') {
                displayValue = getLatinDate(ts, includeTime)
            } else {
                displayValue = includeTime
                    ? ts.toLocaleString(DateTime.DATETIME_SHORT)
                    : ts.toLocaleString(DateTime.DATE_SHORT)
            }

        } else {
            console.log(`${id} ts is NOT valid and is: ${tsWithoutTimeZoneIndex}`)
        }

        if (!this.isVisible(context, id, value)) {
            return nothing
        }

        const validationInfo = skeleton
            ? undefined
            : this.getValidationInfo(context, elementDefinition.binding.field_name)
        if (!skeleton) console.log(`field ${id} with for ${elementDefinition.binding.field_name} has validation info `, validationInfo)
        const cssClasses = this.getCSSClasses(context, elementDefinition.style?.css_classes)

        const cssStyles = this.getCSSStyles(context, elementDefinition.style?.css_styles)

        if (skeleton) {
            cssClasses.push('skeleton')
        }

        if (validationInfo?.hasError) {
            cssStyles["border"] = "1px dotted red"
            console.log(`${id} has Error`)
        } else {
            console.log(`${id} has no Error`)
        }

        parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )


        const isReadOnly =
            (elementDefinition.readonly ?? false) ||
            skeleton
        const disabled = !(elementDefinition.enabled ?? true)
        /* ============================================
            Enough preparation, let's render.
        ============================================ */

        // read-only field
        if (isReadOnly) {
            return parentLayout.renderElement(
                elementDefinition,
                {
                    cssClasses: cssClasses,
                    cssStyles: cssStyles
                },
                (erc) => html`
                    ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                    <div class="date-time-frame">
                        <input
                                id=${id}
                                class=${erc.cssClasses.join(' ')}
                                style=${styleMap(erc.cssStyles)}
                                value=${displayValue || nothing}
                                ?disabled=${isReadOnly}
                        />
                    </div>`
            )
        }

        // normal, active date time field
        if (includeTime) {
            displayValue = ts.toISO({ includeOffset: false, suppressMilliseconds: true }) || ''
            return parentLayout.renderElement(
                elementDefinition,
                {
                    cssClasses: cssClasses,
                    cssStyles: cssStyles
                },
                (erc) => html`
                    ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                    ${timeZoneInfo ? html`
                        <div class="date-time-frame"><i class="time-zone-marker"></i>
                        </div>` : nothing}
                    <vaadin-date-time-picker
                            step="${1}"
                            id=${id}
                            class=${erc.cssClasses.join(' ')}
                            style=${styleMap(erc.cssStyles)}
                            value=${displayValue || nothing}
                            @value-changed=${this.onDataChanged}
                            .i18n="${elementDefinition.date_format === "latin" ? this.latinCustomI18n : this.createDatePickerI18n(context.uicomponent.currentLocale)}}"
                            ?disabled=${disabled}>
                    </vaadin-date-time-picker></div>
                `,
            )
        }
        // normal, active date field (no time component)
        return parentLayout.renderElement(
            elementDefinition,
            {
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
            (erc) => html`
                    ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                    <div >
                        <vaadin-date-picker
                                id=${id}
                                class=${erc.cssClasses.join(' ')}
                                style=${styleMap(erc.cssStyles)}
                                value=${ts.toISODate() || nothing}
                                @value-changed=${this.onDataChanged}
                                .i18n="${elementDefinition.date_format === "latin" ? this.latinCustomI18n : this.createDatePickerI18n(context.uicomponent.currentLocale)}"
                                ?disabled=${disabled}>
                        </vaadin-date-picker>
                    </div>
                `,
        )


    }
}
