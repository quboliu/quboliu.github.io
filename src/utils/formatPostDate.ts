import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import config from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

export function toPostDate(value: string | Date, postTimezone?: string) {
  return dayjs(value).tz(postTimezone ?? config.site.timezone);
}
