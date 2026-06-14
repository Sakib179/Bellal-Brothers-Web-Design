export function money(amount) {
  const value = Number(amount) || 0;
  return `৳ ${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function weekday(iso) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" });
}

export function formatTime(time) {
  const [hourRaw, minuteRaw] = String(time || "00:00").split(":");
  const hour = Number(hourRaw) || 0;
  const minute = Number(minuteRaw) || 0;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const [date, time = "00:00:00"] = String(value).split("T");
  return `${formatDate(date)} ${formatTime(time.slice(0, 5))}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function nowTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function totalsFor(records) {
  const income = records
    .filter((record) => record.type === "জমা")
    .reduce((sum, record) => sum + Number(record.price || 0), 0);
  const expense = records
    .filter((record) => record.type === "খরচ")
    .reduce((sum, record) => sum + Number(record.price || 0), 0);
  return { income, expense, balance: income - expense };
}

export function sortedRecords(records) {
  return [...records].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}

export function groupByDate(records) {
  return sortedRecords(records).reduce((groups, record) => {
    if (!groups[record.date]) groups[record.date] = [];
    groups[record.date].push(record);
    return groups;
  }, {});
}

export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}
