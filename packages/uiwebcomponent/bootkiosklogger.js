// @ts-check
import {KioskIndexedDbLogWriter, KioskLogger} from "@arch-kiosk/appfoundation"
// import {KioskConsoleLogWriter} from "@arch-kiosk/appfoundation";

export function installKioskLogger() {
    /** @type {KioskLogger}
     *
     */
    void new KioskLogger(new KioskIndexedDbLogWriter("K67-logs", "logs"))
    // void new KioskLogger(new KioskConsoleLogWriter())
}

installKioskLogger()
console.log("Kiosk Logger installed")
