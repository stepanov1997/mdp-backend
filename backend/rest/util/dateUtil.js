const getDateTimeFromString = (dateTimeString) => {
    try {
        let date = dateTimeString.split(" ")[0];
        let time = dateTimeString.split(" ")[1];
        let day = date.split(".")[0];
        let month = date.split(".")[1];
        let year = date.split(".")[2];
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];
        let seconds = time.split(":")[2];
        return {day, month, year, hours, minutes, seconds};
    } catch (e) {
        console.log(dateTimeString)
        console.log(e)
    }
    return {}
}

const lastNDays = (dateTime, days) => {
    let millis = dateToMillis(dateTime);
    let millisNow = new Date().getTime();
    let millisSub = (millisNow - millis);
    let daysCalculated = millisSub / (1000 * 60 * 60 * 24);
    return daysCalculated <= days;
}

const substractDateTimes = (dateTimeString1, dateTimeString2) => {
    let date1 = dateToMillis(dateTimeString1);
    let date2 = dateToMillis(dateTimeString2);
    return date2 - date1;
}

const dateToMillis = (dateTimeString) => {
    let dateTime = getDateTimeFromString(dateTimeString);
    const date = new Date(dateTime.year, dateTime.month-1, dateTime.day, dateTime.hours, dateTime.minutes, dateTime.seconds).getTime();
    return date;
}

const compareToDateTimes = (dateTimeString1, dateTimeString2) => {
    let dateTime1 = getDateTimeFromString(dateTimeString1);
    let dateTime2 = getDateTimeFromString(dateTimeString2);

    if (dateTime1.year > dateTime2.year) {
        return 1;
    } else if (dateTime1.year === dateTime2.year) {
        if (dateTime1.month > dateTime2.month) {
            return 1;
        } else if (dateTime1.month === dateTime2.month) {
            if (dateTime1.day > dateTime2.day) {
                return 1;
            } else if (dateTime1.day === dateTime2.day) {
                if (dateTime1.hours > dateTime2.hours) {
                    return 1;
                } else if (dateTime1.hours === dateTime2.hours) {
                    if (dateTime1.minutes > dateTime2.minutes) {
                        return 1;
                    } else if (dateTime1.minutes === dateTime2.minutes) {
                        if (dateTime1.seconds > dateTime2.seconds) {
                            return 1;
                        } else if (dateTime1.seconds === dateTime2.seconds) {
                            return 0;
                        } else {
                            return -1;
                        }
                    } else {
                        return -1;
                    }
                } else {
                    return -1;
                }
            } else {
                return -1;
            }
        } else {
            return -1;
        }
    } else {
        return -1;
    }
}

const chooseOneDate = (func, ...dateTimes) => {
    if (dateTimes.length === 0) return null;
    let temp = dateTimes[0];
    dateTimes.forEach(elem => temp = (func(elem, temp) ? elem : temp));
    return temp;
}

const maxDateTime = (...dateTimes) => chooseOneDate((a, b) => compareToDateTimes(a, b) === 1, ...dateTimes);
const minDateTime = (...dateTimes) => chooseOneDate((a, b) => compareToDateTimes(a, b) === -1, ...dateTimes);

const calculateDuranceBetweenTwoDateTimes = (firstFrom, firstTo, secondFrom, secondTo) => {
    if (compareToDateTimes(secondFrom, firstTo) === 1 ||
        compareToDateTimes(firstFrom, secondTo) === 1)
        return 0;
    let min = minDateTime(firstTo, secondTo);
    let max = maxDateTime(firstFrom, secondFrom);
    return substractDateTimes(min, max);

}

module.exports = {
    getDateTimeFromString,
    compareToDateTimes,
    chooseOneDate,
    maxDateTime,
    minDateTime,
    calculateDuranceBetweenTwoDateTimes,
    lastNDays
}
