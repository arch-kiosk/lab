import { DateTime } from "luxon"
import { UIInputData } from "./uischema"

export function replaceData(template: string | null | undefined, data: UIInputData) {
  // eslint-disable-next-line typescript/no-explicit-any
  let result: any = template
  try {
    if (!template) return ""
    const regex = new RegExp(String.raw`\$\{(.*?)\}`, "g")
    if (typeof result === "string" || result instanceof String) {
      result = result.replace(regex, (_match, p1) => {
        try {
          let v = data[p1]
          if (v) return v
        } catch {}
        return ""
      })
    }
  } catch (e: unknown) {
    console.warn(`Minor error in replaceData: template ${template} caused Exception ${e as string}`)
  }

  return result
}

export function getLatinDate(dt: DateTime, withTime: boolean = true): string {
  const latinMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
  const dtStr = `${dt.day}.${latinMonths[dt.month - 1]}.${dt.year}`
  return withTime ? dtStr + " " + dt.toLocaleString(DateTime.TIME_SIMPLE) : dtStr
}
