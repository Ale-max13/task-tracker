// Находим на странице нужные элементы по их id
// и запоминаем их в переменные, чтобы потом с ними работать.
const taskInput = document.getElementById('task-input');   // поле ввода
const addButton = document.getElementById('add-button');   // кнопка «Добавить»
const taskList = document.getElementById('task-list');     // список задач

// Имя, под которым список задач хранится в localStorage.
// localStorage — это «маленькая память» браузера: то, что туда записано,
// не пропадает после перезагрузки страницы и даже после закрытия браузера.
const STORAGE_KEY = 'tasks';

// Функция создаёт на странице один пункт списка (одну задачу).
// text — текст задачи, done — выполнена ли она (true или false).
// Её используют и при добавлении новой задачи, и при загрузке сохранённых.
function createTaskElement(text, done) {
  // Создаём новый пункт списка <li>. Пока он существует
  // только «в памяти» и на странице не виден.
  const taskItem = document.createElement('li');

  // Создаём чекбокс — квадратик, в котором можно поставить галочку.
  // <input type="checkbox"> — это тоже поле ввода, только другого вида.
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  // Создаём <span> — «обёртку» для текста задачи.
  // Текст нужен в отдельном элементе, чтобы зачёркивать только его,
  // а не весь пункт вместе с чекбоксом.
  const taskText = document.createElement('span');

  // Кладём в span текст задачи.
  // textContent вставляет текст как обычный текст, а не как HTML-код.
  taskText.textContent = text;

  // Функция зачёркивает текст или убирает зачёркивание —
  // в зависимости от того, стоит ли галочка.
  function updateStrike() {
    // checkbox.checked — true, если галочка стоит, и false, если нет.
    if (checkbox.checked) {
      // Галочка стоит — зачёркиваем текст.
      taskText.style.textDecoration = 'line-through';
    } else {
      // Галочки нет — убираем зачёркивание.
      taskText.style.textDecoration = 'none';
    }
  }

  // Если задача уже выполнена (например, загрузили её из памяти),
  // сразу ставим галочку и зачёркиваем текст.
  checkbox.checked = done;
  updateStrike();

  // Следим за чекбоксом: событие change срабатывает,
  // когда галочку ставят или снимают.
  checkbox.addEventListener('change', function () {
    updateStrike();
    saveTasks(); // отметка изменилась — сохраняем список
  });

  // Создаём <label> — «подпись» к чекбоксу.
  // Если положить чекбокс и текст внутрь label, браузер сам свяжет их:
  // щелчок по тексту будет ставить и снимать галочку, как щелчок по чекбоксу.
  const label = document.createElement('label');

  // Кладём в label сначала чекбокс (он будет слева), потом текст.
  label.appendChild(checkbox);
  label.appendChild(taskText);

  // Создаём кнопку удаления со значком корзины.
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '🗑️';

  // title — всплывающая подсказка, которая появляется,
  // если навести мышку на кнопку и немного подождать.
  deleteButton.title = 'Удалить задачу';

  // aria-label — название кнопки для программ экранного доступа
  // (они читают страницу вслух незрячим людям). Без него программа
  // прочитала бы просто «корзина», и было бы непонятно, что делает кнопка.
  deleteButton.setAttribute('aria-label', 'Удалить задачу');

  // Когда на кнопку нажмут — спрашиваем подтверждение.
  deleteButton.addEventListener('click', function () {
    // confirm показывает стандартное окно браузера с кнопками «ОК» и «Отмена».
    // Он возвращает true, если нажали «ОК», и false, если «Отмена».
    // В вопрос подставляем текст задачи, чтобы было видно, что именно удаляем.
    // Знак + склеивает кусочки текста в одну строку.
    if (confirm('Удалить задачу «' + text + '»?')) {
      // Нажали «ОК» — убираем этот пункт со страницы
      // и сохраняем список уже без него.
      taskItem.remove();
      saveTasks();
    }
    // Нажали «Отмена» — ничего не делаем, задача остаётся.
  });

  // Кладём в пункт списка сначала label (чекбокс и текст), потом кнопку.
  // Кнопка лежит вне label, чтобы щелчок по ней не ставил галочку.
  taskItem.appendChild(label);
  taskItem.appendChild(deleteButton);

  // Добавляем пункт в конец списка — теперь он появился на странице.
  taskList.appendChild(taskItem);
}

// Функция добавления новой задачи из поля ввода.
function addTask() {
  // Берём текст из поля. trim() убирает пробелы в начале и в конце,
  // чтобы задача из одних пробелов тоже считалась пустой.
  const text = taskInput.value.trim();

  // Если текст пустой — ничего не делаем и выходим из функции.
  if (text === '') {
    return;
  }

  // Создаём задачу на странице. false — новая задача ещё не выполнена.
  createTaskElement(text, false);

  // Очищаем поле ввода, чтобы можно было сразу написать следующую задачу.
  taskInput.value = '';

  // Список изменился — сохраняем.
  saveTasks();
}

// Функция сохраняет все задачи со страницы в localStorage.
function saveTasks() {
  // Сюда соберём задачи в виде простых записей: { text: ..., done: ... }.
  const tasks = [];

  // Проходим по всем пунктам списка по очереди.
  // querySelectorAll('li') находит все пункты <li> внутри списка.
  taskList.querySelectorAll('li').forEach(function (taskItem) {
    tasks.push({
      text: taskItem.querySelector('span').textContent,      // текст задачи
      done: taskItem.querySelector('input').checked,         // стоит ли галочка
    });
  });

  // localStorage умеет хранить только текст, поэтому превращаем
  // список задач в строку с помощью JSON.stringify.
  // try/catch — «попробуй, а если не вышло, не ломай страницу»:
  // в некоторых режимах браузера (например, в приватном окне) запись запрещена.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Не удалось сохранить задачи:', error);
  }
}

// Функция загружает сохранённые задачи и показывает их на странице.
function loadTasks() {
  try {
    // Достаём строку из localStorage. Если там ничего нет, получим null.
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return; // сохранённых задач нет — показываем пустой список
    }

    // Превращаем строку обратно в список задач.
    const tasks = JSON.parse(saved);

    // Для каждой сохранённой задачи создаём пункт на странице.
    tasks.forEach(function (task) {
      createTaskElement(task.text, task.done);
    });
  } catch (error) {
    // Если память недоступна или данные испорчены — просто начинаем
    // с пустого списка, страница при этом продолжает работать.
    console.warn('Не удалось загрузить задачи:', error);
  }
}

// Говорим кнопке: «Когда на тебя нажмут (click), запусти addTask».
addButton.addEventListener('click', addTask);

// То же самое для клавиши Enter в поле ввода:
// при каждом нажатии клавиши проверяем, Enter это или нет.
taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

// При открытии страницы сразу загружаем сохранённые задачи.
loadTasks();
