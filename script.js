// Находим на странице нужные элементы по их id
// и запоминаем их в переменные, чтобы потом с ними работать.
const taskInput = document.getElementById('task-input');   // поле ввода
const addButton = document.getElementById('add-button');   // кнопка «Добавить»
const taskList = document.getElementById('task-list');     // список задач

// Функция добавления задачи.
// Функция — это набор действий, у которого есть имя.
// Мы описываем действия один раз, а запускаем их когда нужно.
function addTask() {
  // Берём текст из поля. trim() убирает пробелы в начале и в конце,
  // чтобы задача из одних пробелов тоже считалась пустой.
  const text = taskInput.value.trim();

  // Если текст пустой — ничего не делаем и выходим из функции.
  if (text === '') {
    return;
  }

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

  // Следим за чекбоксом: событие change срабатывает,
  // когда галочку ставят или снимают.
  checkbox.addEventListener('change', function () {
    // checkbox.checked — true, если галочка стоит, и false, если нет.
    if (checkbox.checked) {
      // Галочка стоит — зачёркиваем текст.
      taskText.style.textDecoration = 'line-through';
    } else {
      // Галочку сняли — убираем зачёркивание.
      taskText.style.textDecoration = 'none';
    }
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
      // Нажали «ОК» — убираем этот пункт со страницы.
      taskItem.remove();
    }
    // Нажали «Отмена» — ничего не делаем, задача остаётся.
  });

  // Кладём в пункт списка сначала label (чекбокс и текст), потом кнопку.
  // Кнопка лежит вне label, чтобы щелчок по ней не ставил галочку.
  taskItem.appendChild(label);
  taskItem.appendChild(deleteButton);

  // Добавляем пункт в конец списка — теперь он появился на странице.
  taskList.appendChild(taskItem);

  // Очищаем поле ввода, чтобы можно было сразу написать следующую задачу.
  taskInput.value = '';
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
