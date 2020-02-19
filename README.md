# AliExpress Affiliate Checker
Скрипт для проверки аффилиатности товаров на AliExpress.

Работает на aliexpress.com и aliexpress.ru, поддерживает страницы с адресами вида ".../item/...", ".../i/..." и мобильные.

Индикация аффилиатности - полоска слева от цены:  
![Индикация](img/indication.png)

**Цвета по умолчанию:**
* ![Зелёный](https://via.placeholder.com/10x16/07e100/000000?text=+) - аффилиатный товар.
* ![Красный](https://via.placeholder.com/10x16/e10000/000000?text=+) - неаффилиатный товар.
* ![Оранжевый](https://via.placeholder.com/10x16/e1be00/000000?text=+) - сервисы выдали разный результат (если выбран режим проверки всеми сервисами).
* ![Серый](https://via.placeholder.com/10x16/bbbbbb/000000?text=+) - не удалось проверить.

Вверху скрипта есть секция с настройками, которые можно настроить под себя.

По умолчанию скрипт проверяет товар при клике по цене, но можно включить автоматическую проверку при открытии страницы товара. Также можно изменить сервис проверки и внешний вид полоски индикации.

## Установка
1. Установить одно из браузерных расширений для выполнения пользовательских скриптов.  
   Tampermonkey: [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ru), [Firefox](https://addons.mozilla.org/ru/firefox/addon/tampermonkey/), [Opera](https://addons.opera.com/ru/extensions/details/tampermonkey-beta/)  
   Violentmonkey: [Chrome](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag?hl=ru), [Firefox](https://addons.mozilla.org/ru/firefox/addon/violentmonkey/), [Maxthon](https://extension.maxthon.com/detail/index.php?view_id=1680)  
   Greasemonkey: [Firefox](https://addons.mozilla.org/ru/firefox/addon/greasemonkey/)
2. Перейти [сюда](/../../raw/master/AliExpressAffiliateChecker.user.js).
3. Подтвердить установку скрипта.

Если не хотите, чтобы скрипт обновлялся автоматически, то отключите автообновление в своём скриптовом расширении.

## Накормить
WMZ: Z295739372858  
WMR: R284351743434  
Yandex: [410011391610131](https://money.yandex.ru/to/410011391610131)

![Котик](img/cat.png)