// ==UserScript==
// @name AliExpress Affiliate Checker
// @description Проверяет аффилиатность товаров на AliExpress
// @author longnull
// @namespace longnull
// @version 1.0
// @homepage https://github.com/longnull/AliExpressAffiliateChecker
// @supportURL https://github.com/longnull/AliExpressAffiliateChecker/issues
// @updateURL https://raw.githubusercontent.com/longnull/AliExpressAffiliateChecker/master/AliExpressAffiliateChecker.user.js
// @downloadURL https://raw.githubusercontent.com/longnull/AliExpressAffiliateChecker/master/AliExpressAffiliateChecker.user.js
// @match *://*.aliexpress.com/item/*
// @match *://*.aliexpress.com/i/*
// @match *://*.aliexpress.ru/item/*
// @match *://*.aliexpress.ru/i/*
// @grant GM_xmlhttpRequest
// @grant GM.xmlHttpRequest
// @connect backit.me
// @connect letyshops.com
// @connect skidka.ru
// ==/UserScript==

(() => {
  //=========================================================================================

  // true - автоматическая проверка при открытии страницы товара
  // false - проверка при клике по цене на странице товара
  const autoCheck = false;
  // Сервис, которым будет проверяться аффилиатность товаров
  // Если указан конкретный сервис, то в первую очередь будет использован он, если проверить не удалось, то будут использованы другие
  // Возможные значения:
  //   backit - проверять через Backit
  //   letyshops - проверять через LetyShops
  //   skidka - проверять через Skidka.ru
  //   all - проверять всеми сервисами
  const service = 'backit';
  // Цвет полоски: аффилиатный товар
  const colorAffiliate = '#07e100';
  // Цвет полоски: неаффилиатный товар
  const colorNotAffiliate = '#e10000';
  // Цвет полоски: сервисы выдали разный результат (если service = 'all')
  const colorVarious = '#e1be00';
  // Цвет полоски: не удалось проверить
  const colorError = '#bbbbbb';
  // Ширина полоски
  const borderWidth = 4;

  //=========================================================================================

  const httpRequest = (params) => {
    return new Promise((resolve) => {
      params.timeout = 30000;
      params.onload = resolve;
      params.onerror = resolve;
      params.ontimeout = resolve;
      params.onabort = resolve;

      const func = typeof GM !== 'undefined' ? GM.xmlHttpRequest : GM_xmlhttpRequest;
      func(params);
    });
  };

  const checkers = {
    async backit() {
      const response = await httpRequest({
        method: 'GET',
        url: `https://app.backit.me/affiliate/checkLink?link=${encodeURIComponent(location.origin + location.pathname)}`
      });

      if (response.status !== 200) {
        return null;
      }

      try {
        const res = JSON.parse(response.responseText);

        if (!res.result || res.data.attributes.affiliateType === 0) {
          return null;
        }

        return res.data.attributes.affiliateType !== 2;
      } catch (e) {
        return null;
      }
    },
    async letyshops() {
      const response = await httpRequest({
        method: 'GET',
        url: `https://letyshops.com/product-check-cashback?shop=aliexpress&product=${encodeURIComponent((location.origin + location.pathname).replace('/i/', '/item/'))}`
      });

      if (response.status !== 200) {
        return null;
      }

      try {
        const res = JSON.parse(response.responseText);

        if (!res.data) {
          return null;
        }

        return res.data.valid;
      } catch (e) {
        return null;
      }
    },
    async skidka() {
      const response = await httpRequest({
        method: 'GET',
        url: `https://skidka.ru/check_ali_affiliate?checkUrl=${encodeURIComponent(location.origin + location.pathname)}`
      });

      if (response.status !== 200) {
        return null;
      }

      try {
        const res = JSON.parse(response.responseText);

        if (!res.isSuccess) {
          return null;
        }

        return res.isAffiliateItem;
      } catch (e) {
        return null;
      }
    }
  }

  const check = async () => {
    if (checking) {
      return;
    }

    checking = true;

    let color;
    let res = null;
    const svc = service.toLowerCase();
  
    if (svc !== 'all') {
      if (!checkers[svc]) {
        return;
      }
  
      res = await checkers[svc]();
  
      if (res === null) {
        for (const c in checkers) {
          if (c !== svc) {
            res = await checkers[c]();
  
            if (res !== null) {
              break;
            }
          }
        }
      }
    } else {
      for (const c in checkers) {
        const r = await checkers[c]();
  
        if (res !== null && r !== null) {
          if (res !== r) {
            color = colorVarious;
            break;
          }
        }
  
        res = r;
      }
    }

    if (!color) {
      color = res === true ? colorAffiliate : res === false ? colorNotAffiliate : colorError;
    }

    element.style.borderLeft = `${borderWidth}px solid ${color}`;

    if (color !== colorError) {
      element.removeEventListener('click', check);
      element.style.cursor = null;
      element.title = color === colorAffiliate ? 'Аффилиатный товар' : color === colorNotAffiliate ? 'Неаффилиатный товар' : 'Сервисы выдали разный статус аффилиатности товара';
    } else {
      element.title = 'Не удалось проверить аффилиатность товара';
    }

    checking = false;
  };

  let checking = false;
  const element = document.querySelector('.product-main-wrap .product-price-current, .detail-wrap .current-price, .detail-price-wish-wrap .current-price');

  if (element) {
    if (autoCheck) {
      check();
    } else {
      element.addEventListener('click', check);
      element.style.cursor = 'pointer';
      element.title = 'Проверить аффилиатность товара';
    }
  }
})();