export const getDaysDifference = (a: Date, b: Date = new Date()) => {
    const o = new Date(a.getTime());
    const c = new Date(b.getTime());
    o.setHours(0, 0, 0, 0);
    c.setHours(0, 0, 0, 0);
    return (c.getTime() - o.getTime()) / (1000 * 60 * 60 * 24);
}

export const formatDateTimeShort = (isoDateString: string, locale: string = 'en-US') => {
    if (!isoDateString) return 'n/a';

    const a = new Date(isoDateString);
    const c = new Date();
    const diff = getDaysDifference(a, c);

    if (diff < 1) {
        return a.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'});
    }

    if ((a.getFullYear() === c.getFullYear())) {
        return a.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
    }

    return a.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export const formatDateTime = (isoDateString: string, locale: string = 'en-US') => {
    if (!isoDateString) return 'n/a';

    const a = new Date(isoDateString);
    const c = new Date();
    const diff = getDaysDifference(a, c)

    if (diff < 1) {
        return a.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'});
    }

    if (diff === 1) {
        return ('Yesterday ' + a.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'}))
    }

    if (diff < 7) {
        return (
            a.toLocaleDateString(locale, { weekday: 'long' }) 
            + ' ' +
            a.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'})
        )
    }

    if (a.getFullYear() === c.getFullYear()) {
        return (
            a.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }) 
            + ' ' +
            a.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'})
        )
    }

    return a.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
}