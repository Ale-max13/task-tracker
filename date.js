// ===== Сегодняшняя дата над карточкой =====

// Находим на странице абзац, куда будем писать дату.
const todayElement = document.getElementById('today-date');

// new Date() — текущие дата и время, взятые с часов компьютера.
const today = new Date();

// toLocaleDateString превращает дату в текст на нужном языке.
// 'ru-RU' — по-русски. В скобках говорим, что именно показать:
//   weekday: 'long' — день недели полностью («среда»),
//   day: 'numeric'  — число («25»),
//   month: 'long'   — месяц словом («ноября»).
// Получится, например: «среда, 25 ноября».
const dateText = today.toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

// День недели получается с маленькой буквы, а нам нужна большая.
// dateText[0] — первая буква, toUpperCase() делает её заглавной,
// slice(1) — весь остальной текст начиная со второй буквы.
const capitalized = dateText[0].toUpperCase() + dateText.slice(1);

// Добавляем год через пробел. getFullYear() даёт год числом, например 2026.
// Год дописываем сами, а не через toLocaleDateString: тот добавил бы
// в конце «г.» («25 ноября 2026 г.»), а нам это не нужно.
const fullDate = capitalized + ' ' + today.getFullYear();

// Показываем дату на странице.
todayElement.textContent = fullDate;
