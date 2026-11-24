// ===== Переключатель тем: светлая, тёмная, системная =====
//
// Как это работает:
// 1. Выбор пользователя ('light', 'dark' или 'system') хранится в localStorage.
// 2. На тег <html> ставим метку data-theme="light" или data-theme="dark".
// 3. style.css смотрит на эту метку и включает нужные цвета.
//
// Этот файл подключён в <head>, а не в конце страницы. Так тема ставится
// ещё до того, как страница нарисуется, и при обновлении не будет
// «вспышки» светлой темы перед тёмной.

// Имя, под которым выбор темы хранится в localStorage.
const THEME_KEY = 'theme';

// Спрашиваем у браузера: «Включена ли в системе тёмная тема?»
// darkQuery.matches — true, если в настройках Windows выбрана тёмная тема.
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Функция достаёт сохранённый выбор. Если его нет — светлая тема.
function getSavedChoice() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    // Принимаем только три известных значения, всё остальное — как «нет выбора».
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (error) {
    console.warn('Не удалось прочитать тему:', error);
  }
  return 'light'; // при первом открытии — светлая тема
}

// Функция запоминает выбор в localStorage.
function saveChoice(choice) {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch (error) {
    console.warn('Не удалось сохранить тему:', error);
  }
}

// Функция включает тему на странице.
function applyTheme(choice) {
  let theme = choice;

  // «Системная» — смотрим на настройку Windows и берём светлую или тёмную.
  if (choice === 'system') {
    if (darkQuery.matches) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  }

  // document.documentElement — это тег <html>.
  // Ставим ему метку data-theme, по которой работает style.css.
  document.documentElement.dataset.theme = theme;
}

// Функция подсвечивает выбранную кнопку переключателя.
// aria-pressed="true" значит «кнопка нажата»: по этой метке
// style.css подсвечивает кнопку, а программы экранного доступа
// сообщают, какая тема выбрана.
function updateButtons(choice) {
  document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
    if (button.dataset.themeChoice === choice) {
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.setAttribute('aria-pressed', 'false');
    }
  });
}

// Текущий выбор пользователя. let — потому что он будет меняться.
let currentChoice = getSavedChoice();

// Сразу включаем тему — ещё до того, как страница нарисуется.
applyTheme(currentChoice);

// Если выбрана «Системная» и пользователь поменял тему в Windows,
// страница переключится сама, без обновления.
darkQuery.addEventListener('change', function () {
  if (currentChoice === 'system') {
    applyTheme('system');
  }
});

// Кнопки переключателя находятся ниже в HTML, и сейчас их ещё нет.
// DOMContentLoaded — событие «страница загружена»: тогда кнопки уже есть,
// и можно подсветить выбранную и научить кнопки реагировать на щелчок.
document.addEventListener('DOMContentLoaded', function () {
  updateButtons(currentChoice);

  document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      // data-theme-choice у кнопки — это 'light', 'dark' или 'system'.
      currentChoice = button.dataset.themeChoice;
      applyTheme(currentChoice);
      saveChoice(currentChoice);
      updateButtons(currentChoice);
    });
  });
});
