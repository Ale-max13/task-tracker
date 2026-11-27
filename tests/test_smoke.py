"""Smoke-тесты трекера задач: Selenium + pytest, браузер Chrome.

Smoke-тесты («дымовые») — быстрая проверка, что главные функции вообще
работают: задачу можно добавить, она сохраняется, отмечается и удаляется.

Как запустить (из корня проекта):
    pip install selenium pytest
    pytest tests/test_smoke.py -v
"""

from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# Путь к index.html: берём папку, где лежит этот файл (tests),
# поднимаемся на уровень выше (корень проекта) и добавляем index.html.
# as_uri() превращает путь в адрес для браузера вида file:///C:/.../index.html.
INDEX_URL = (Path(__file__).resolve().parent.parent / "index.html").as_uri()

# Сколько секунд максимум ждать, пока на странице что-то появится.
TIMEOUT = 5

# Локаторы — «адреса» элементов на странице, по которым Selenium их ищет.
TASK_INPUT = (By.ID, "task-input")
ADD_BUTTON = (By.ID, "add-button")
TASK_ITEMS = (By.CSS_SELECTOR, "#task-list li")


@pytest.fixture
def driver():
    """Открывает Chrome с трекером и чистым localStorage, после теста закрывает."""
    options = webdriver.ChromeOptions()
    # Браузер работает «без окна» — так тесты идут быстрее.
    # Чтобы смотреть глазами, что делает тест, закомментируй эту строку.
    options.add_argument("--headless=new")

    browser = webdriver.Chrome(options=options)

    # Открываем страницу, стираем всё из localStorage и обновляем страницу,
    # чтобы она загрузилась уже с пустым списком задач.
    browser.get(INDEX_URL)
    browser.execute_script("window.localStorage.clear();")
    browser.refresh()

    # yield отдаёт браузер тесту. Код после yield выполнится,
    # когда тест закончится (даже если он упал).
    yield browser

    browser.quit()


def add_task(driver, text):
    """Вводит текст в поле и нажимает «Добавить»."""
    wait = WebDriverWait(driver, TIMEOUT)
    task_input = wait.until(EC.visibility_of_element_located(TASK_INPUT))
    task_input.send_keys(text)
    driver.find_element(*ADD_BUTTON).click()


def wait_for_task(driver, text):
    """Ждёт, пока в списке появится задача с этим текстом, и возвращает её <li>."""
    wait = WebDriverWait(driver, TIMEOUT)
    # Ищем <li>, внутри которого есть <span> ровно с таким текстом.
    locator = (By.XPATH, f'//ul[@id="task-list"]/li[.//span[text()="{text}"]]')
    return wait.until(EC.visibility_of_element_located(locator))


def test_add_task(driver):
    """1. Задача добавляется и появляется в списке."""
    add_task(driver, "Купить молоко")

    task = wait_for_task(driver, "Купить молоко")

    # В списке ровно одна задача, и текст у неё правильный.
    assert len(driver.find_elements(*TASK_ITEMS)) == 1
    assert task.find_element(By.TAG_NAME, "span").text == "Купить молоко"


def test_task_stays_after_reload(driver):
    """2. Задача остаётся после обновления страницы."""
    add_task(driver, "Позвонить маме")
    wait_for_task(driver, "Позвонить маме")

    # Обновляем страницу — как будто нажали F5.
    driver.refresh()

    # Задача должна снова появиться: её загрузили из localStorage.
    task = wait_for_task(driver, "Позвонить маме")
    assert task.find_element(By.TAG_NAME, "span").text == "Позвонить маме"


def test_mark_task_done(driver):
    """3. Задачу можно отметить выполненной: появляется галочка и зачёркивание."""
    add_task(driver, "Сделать зарядку")
    task = wait_for_task(driver, "Сделать зарядку")

    checkbox = task.find_element(By.CSS_SELECTOR, "input[type='checkbox']")
    task_text = task.find_element(By.TAG_NAME, "span")

    # До щелчка галочки нет и текст не зачёркнут.
    assert not checkbox.is_selected()
    assert task_text.value_of_css_property("text-decoration-line") == "none"

    checkbox.click()

    # Ждём, пока галочка встанет.
    WebDriverWait(driver, TIMEOUT).until(EC.element_to_be_selected(checkbox))

    # Текст должен стать зачёркнутым (line-through — «линия поперёк»).
    WebDriverWait(driver, TIMEOUT).until(
        lambda d: task_text.value_of_css_property("text-decoration-line") == "line-through"
    )


def test_delete_task(driver):
    """4. Задачу можно удалить."""
    add_task(driver, "Вынести мусор")
    task = wait_for_task(driver, "Вынести мусор")

    # Нажимаем на 🗑️ — ищем кнопку по подсказке «Удалить задачу».
    task.find_element(By.CSS_SELECTOR, "button[aria-label='Удалить задачу']").click()

    # Появляется стандартное окно браузера (confirm). Ждём его и проверяем текст.
    wait = WebDriverWait(driver, TIMEOUT)
    alert = wait.until(EC.alert_is_present())
    assert alert.text == "Удалить задачу «Вынести мусор»?"

    # Нажимаем «ОК».
    alert.accept()

    # Ждём, пока задача исчезнет со страницы, и проверяем, что список пуст.
    wait.until(EC.staleness_of(task))
    assert len(driver.find_elements(*TASK_ITEMS)) == 0
