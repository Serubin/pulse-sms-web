export default class TimeUtils {

    static second () {
        return 1000;
    }

    static minute () {
        return TimeUtils.second() * 60;
    }

    static hour () {
        return TimeUtils.minute() * 60;
    }

    static day () {
        return TimeUtils.hour() * 24;
    }

    static year () {
        return TimeUtils.day() * 365;
    }

    static formatTimestamp (timestamp, currentTime) {
        let date = new Date(timestamp);

        if (timestamp > currentTime - 2 * TimeUtils.minute()) {
            return "Now";
        } else if (timestamp > TimeUtils.isToday(currentTime)) {
            let options = { second: undefined, hour: 'numeric', minute: 'numeric' };
            return date.toLocaleTimeString(undefined, options);
        } else if (timestamp > currentTime - 7 * TimeUtils.day()) {
            let options = { second: undefined, hour: 'numeric', minute: 'numeric', weekday: 'short' };
            return date.toLocaleTimeString(undefined, options);
        } else if (timestamp > currentTime - 1 * TimeUtils.year()) {
            let options = { month: 'short', day: 'numeric', second: undefined, hour: 'numeric', minute: 'numeric'};
            return date.toLocaleDateString(undefined, options);
        } else {
            return TimeUtils.fullTimestamp(date);
        }
    }

    static formatConversationTimestamp (timestamp, currentTime) {
        let date = new Date(timestamp);

        if (TimeUtils.isToday(timestamp)) {
            let options = { second: undefined, hour: 'numeric', minute: 'numeric' };
            return date.toLocaleTimeString(undefined, options);
        } else if (timestamp > currentTime - 7 * TimeUtils.day()) {
            let options = { second: undefined, hour: 'numeric', minute: 'numeric', weekday: 'short' };
            return date.toLocaleTimeString(undefined, options);
        } else if (timestamp > currentTime - 1 * TimeUtils.year()) {
            let options = { month: 'short', day: 'numeric', second: undefined, hour: 'numeric', minute: 'numeric'};
            return date.toLocaleDateString(undefined, options);
        } else {
            return TimeUtils.fullTimestamp(date);
        }
    }

    static fullTimestamp(date) {
        let options = { year: 'numeric', month: 'short', day: 'numeric', second: undefined, hour: 'numeric', minute: 'numeric'};
        return date.toLocaleDateString(undefined, options);
    }

    static isToday (timestamp) {
        let current = new Date();
        TimeUtils.zeroDate(current);

        let time = new Date(timestamp);
        TimeUtils.zeroDate(time);

        return current.getTime() == time.getTime();
    }

    static isYesterday (timestamp) {
        let yesterday = new Date();
        TimeUtils.zeroDate(yesterday);
        yesterday = new Date(yesterday.getTime() - 1000 * 60 * 60 * 24)

        let time = new Date(timestamp);
        TimeUtils.zeroDate(time);

        return yesterday.getTime() == time.getTime();
    }

    static isLastWeek (timestamp) {
        let lastWeek = new Date();
        TimeUtils.zeroDate(lastWeek);
        lastWeek = new Date(lastWeek.getTime() - 1000 * 60 * 60 * 24 * 7)

        return timestamp > lastWeek.getTime() && timestamp < (new Date().getTime());
    }

    static isLastMonth (timestamp) {
        return new Date().getMonth() == new Date(timestamp).getMonth();
    }

    static zeroDate (date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }
}
