export const AvamRegex = {
    stesSuche: {
        geburtsdatum: {
            validDateFormat: /^[0-9]{2}.[0-9]{2}.[0-9]{4}$/,
            valid31dayMonth: /^(([0-2][0-9]|3[01]).(0[013578]|1[02]).([0-2][0-9]{3}))$/,
            valid30dayMonth: /^(([0-2][0-9]|30).(0[013456789]|1[012]).([0-2][0-9]{3}))$/,
            valid29dayFebruary: /^(([0-2][0-9]).02.([0-2][0-9]{3}))$/,
            invalidNullInput: /^(00.00.0000)$/,
            invalidOnlyDayInput: /^0[1-9]{1}\.00\.0000$/,
            invalidOnlyMonthInput: /^00.[1-9]{2}.0000$/,
            invalidDayAndMonthInput: /(0[1-9]|1[0-9]|2[0-9]|3[0-1])\.(0[1-9]|1[0-2])\.0000$/,
            validBirthdayYear: /^[0-9]{2}.[0-9]{2}.(19[0-9]{2}|[2-9][0-9]{3})$/,
            validDateFormatSuche: /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])\.(0[1-9]|1[012])\.([0-9]{4})|^(00\.00\.0000)|^[0]{2}\.[0]{2}\.[0-9]{4}|^[0]{2}\.[0-9]{2}\.[1-2]{1}[0-9]{3}$/,
            validDateFormatAnmeldung: /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])\.(0[1-9]|1[012])\.([0-9]{4})|^(00\.00\.0000)|^[0]{2}\.[0]{2}\.[0-9]{4}|^[0]{2}\.[0-9]{2}\.[0-9]{4}$/
        }
    },
    common: {
        val057: /^[a-zA-Z]{1}[a-zA-Z0-9]{1}[0-9]{6}$/,
        val011: /^[0-9]{8}$/,
        val010: /^[0-9]{11}$/,
        positiveNr: /^\d+$/,
        passwordFormat: /^.{8}$/,
        textOnlyLetters: /^[a-zA-Z]+$/,
        textWithAsterisk: /^[\u002A]?(?:[\u0041-\u005A ]+|[\u0061-\u007A ]+|[\u00A0-\u00FF ]+)+[\u002A]?$/,
        jahr4ziffern: /^[0-9]{4}$/,
        val250: /^([0-9]{2}:?[0-9]{2})$/,
        val251: /^(([0-1][0-9]|[2][0-3]):?([0-5][0-9]))$/,
        val216: /^[0-9]*[a-zA-Z]+[0-9]*$/
    },
    email: {
        emailPattern: /^(.+)@(.+)$/,
        specialChars: '\\(\\)><@,;:\\\\\\"\\.\\[\\]',
        quotedUser: '("[^"]*")',
        ipDomainPattern: /^\[(\d{ ,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/
    }
};

function getMonths() {
    return [
        'januar',
        'februar',
        'märz',
        'april',
        'mai',
        'juni',
        'juli',
        'august',
        'september',
        'oktober',
        'november',
        'dezember',
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'aout',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
        'gennaio',
        'febbraio',
        'marzo',
        'aprile',
        'maggio',
        'giugno',
        'luglio',
        'agosto',
        'settembre',
        'ottobre',
        'novembre',
        'dicembre'
    ];
}

export const ValidationConstants = {
    id: {
        val052: 4671,
        typingFormatterDefaultId: -1,
        val212: -1
    },
    months: getMonths()
};
