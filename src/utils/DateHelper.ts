const formatDateTimeShort = (utcDateString: string, locale: string = 'en-US') => {
    const utcDate = new Date(utcDateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const sameYear = utcDate.getFullYear() === currentDate.getFullYear();
    if (!sameYear) {
        return utcDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
    }

    if (utcDate.getDate() == currentDate.getDate() && utcDate.getMonth() == currentDate.getMonth()) {
        return utcDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'});
    }

    return utcDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
}

const formatDateTime = (utcDateString: string, locale: string = 'en-US') => {
    const utcDate = new Date(utcDateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const sameYear = utcDate.getFullYear() === currentDate.getFullYear();
    if (!sameYear) {
        return utcDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
    }

    if (utcDate.getDate() == currentDate.getDate() && utcDate.getMonth() == currentDate.getMonth()) {
        return utcDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'});
    }

    // is less than 7 days
    const daysDiff = (currentDate.getTime() - utcDate.getTime()) / (24 * 60 * 60 * 1000)
    if (daysDiff < 7 ) {
        if (daysDiff < 2) {
            return (
                'Yesterday ' + utcDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'})
            )
        }
        return (
            utcDate.toLocaleDateString(locale, { weekday: 'long' }) 
            + ' ' +
            utcDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'})
        )
    }

    return (
        utcDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }) 
        + ' ' +
        utcDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit'})
    )
}

export {
    formatDateTime,
    formatDateTimeShort
}