HUKAM_LOGGER = window.HUKAM_LOGGER || (() => {
    const logLevel = new Map()
    logLevel.set('debug', 1)
    logLevel.set('info', 2)
    logLevel.set('error', 3)

    class Logger {
        constructor(level = 'debug') {
            this.level = level
        }

        debug(args) {
            if (logLevel.get('debug') >= logLevel.get(this.level)) {
                console.log(`[${this.level}]`, args)
            }
        }

        info(args) {
            if (logLevel.get('info') >= logLevel.get(this.level)) {
                console.log(`[${this.level}]`, args)
            }
        }

        error(args) {
            if (logLevel.get('error') >= logLevel.get(this.level)) {
                console.log(`[${this.level}]`, args)
            }
        }
    }

    return Logger
})()
