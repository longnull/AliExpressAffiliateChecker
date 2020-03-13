// ==UserScript==
// @name AliExpress Affiliate Checker
// @description Проверяет аффилиатность товаров на AliExpress
// @author longnull
// @namespace longnull
// @version 1.1
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
  'use strict';

  //=========================================================================================

  const config = {
    // true - автоматическая проверка при открытии страницы товара
    // false - проверка при клике по цене на странице товара
    autoCheck: false,
    // Сервисы, которыми будет проверяться аффилиатность товаров
    // Доступные значения:
    //   backit - Backit. Отображается процент кэшбэка и статус повышенного кэшбэка
    //   letyshops - LetyShops
    //   skidka - Skidka.ru. Отображается процент кэшбэка
    services: ['backit', 'letyshops', 'skidka'],
    // Цвет индикации: аффилиатный товар
    colorAffiliate: '#deffde',
    // Цвет индикации: неаффилиатный товар
    colorNotAffiliate: '#ffdede',
    // Цвет индикации: не удалось проверить
    colorError: '#e3e3e3'
  };

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

  const services = {
    backit: {
      name: 'Backit',
      url: 'https://backit.me/cashback/shops/ali',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAALVBMVEVHcEwAAAAAAADP/ADP/AAuOABmfADI9ADd/wDP/QDP/AAAAADK9wA7SABlewDkN1KPAAAACnRSTlMAtga2BuoMuAa2jOpPLgAAAD9JREFUKM9jWAUHix0YQGBQCZwBgeNJSkAAFljz9i4QXBUEAYjA7d1wMHgFjIFgejSSgAsQtEkjCYAA0yAUAAC0Lx1dRjeOxQAAAABJRU5ErkJggg==',
      async check() {
        const response = await httpRequest({
          method: 'GET',
          url: `https://app.backit.me/affiliate/checkLink?link=${encodeURIComponent((location.origin + location.pathname).replace('/i/', '/item/'))}`,
          headers: {
            'X-API-VERSION': '2.1',
            'X-CLIENT-ID': 'web-client'
          }
        });

        if (response.status !== 200) {
          return null;
        }

        try {
          const res = JSON.parse(response.responseText);

          if (!res.result || res.data.attributes.affiliateType === 0) {
            return null;
          }

          return {
            affiliate: res.data.attributes.affiliateType !== 2,
            rate: res.data.attributes.cashback.replace(/ /g, ''),
            hot: res.data.attributes.isHotsale
          };
        } catch (e) {
          return null;
        }
      },
    },
    letyshops: {
      name: 'LetyShops',
      url: 'https://letyshops.com/shops/aliexpress',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA/FBMVEVHcEz////80xv80xv////80xv80hX////////////////80xv////////80xv931n/+eD80xv///8SEhIPEBH80xj/1hsODg7///8LCwz80xr/+ub+3lD91SH+1RmFcBX82DL/9sr+7aL//vj95Xd7e3suLi4aGhrV1dUWFha3t7ckJCTe3t6Hh4fx8fEbGRL8/Pztxxr19fXFphmCgoJqamo6OjtYWFWqqqr954L78snr6+uxsbFFRUXBwcGmkS6hoaGRkZErJxOpjxhLS0uSexeQkJBEOxTbuBpjVRVmZmbk5OTJyclQUFB0dHSfhhd7bSzR0dH44HLr59O3cCE7AAAAEXRSTlMAyt+P3/wj/I8j3srJNzfJN1GHnoUAAAE7SURBVDjLfZPXcsIwEEWXEmxIRZLRUJ0GtjHF9PSQ3vv//0tWprlInNc90uzO3AsAmVRyIx/BOCVES+tZQHY28zGMSpkIEtv4XjbfPyAztrKQis9L1UOyQIek5IPjo6WQg/B+BaQ2X8BHg9C892Ca5vUZCRASCoMuY8URUQt3lFJ2s0YwGaVOUy3kX1BwbbXQe2KUj8+VQu35FoWJpxYGXUp5nSiFwhceQadKoVT9xh2tK7XwO+GUNVoqwaj8jTnllx2FgBmwXdzx1ZMLIgNNB4U2kQsiA1O8gY/6UsEP4Ym40vr4rNsxYRbCH5eJP7j1HhXmIfTqVBis8RYVFiHstBsO58X7fkQwliH0WhePw2EoEBjaVQskaJAMtiBODosTaEEcHTK75TVzrB7sJdRzUV6ArJ7WpPv59f8Hhs9SMrQm3HEAAAAASUVORK5CYII=',
      async check() {
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

          return {
            affiliate: res.data.valid
          };
        } catch (e) {
          return null;
        }
      },
    },
    skidka: {
      name: 'Skidka.ru',
      url: 'https://skidka.ru/shops/details/aliexpress-keshbek',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAIxUExURUdwTIy+8xOA6R+s/kV/31mk7htf1cDZ93Ky8Tar+SJa0Stx3C+q+gmj/Sdy3Tln1Cda0CqK6SyL6S2M6Qel/jhn1CCv/y2M6Rh24iFZ0Uuc7R+Q7y9h0haq/j2u+A+P8TCq+QWY+Ama+D163Sxr2AyI7hyV8i9l1QmT9Bej+i9j1Cdf0xKR8TRx2him/EZ+3iKl+R1v3gim/iNXzxeI7BV+51R92h574xx54xZ65A2n/gyn/hmJ7CRx3Tt93xib9Rtp2ih94hCk/Amg+xeV8iJZ0Ed32gad+h1c0y1o1xpm2Ryj+SJw3Q6k/BWU8hug+AaU9Rdh1xZj2AWW9wuE7AuC6xhf1v///xlc0xle1QmG7QaS9AeM8QmI7gaQ9A195w935RZl2QmK8ASa+QeO8g955hB14xBz4Q1+6AyA6hVn2hpa0gOc+hRr3RpY0QKd+wx45htW0AGf/ASa+hJx4BNt3g575gSY+AyA6RBv4BRp2xxUzwGh/Qp76BFm2w5u4PP4/hRp3BGA6QOO8/b6/rbT9hJv3wmN8v3+/1ih7Q9r3hR343Gn6xeK7cTi+0uO5bvU9gyM8E6v9jCf8w6G7Gi793ez8AaG7nvA9zCH55jA8WOl7Or0/YK48bbY+a/T9xNj2SWG6BZ14u71/SR74l2W5t3v/ePv/IXG+Nnp+waI74vI+Emm8lKZ6dbn+h995KPI84Cv7GKt8SFv3EWe7xJ95sLe+Xqo6h9t3FSX6M7h+RQwWlMAAABQdFJOUwAF7G0pEnkBCiznljXjfm3PZlZL61BQeOjtH4uMiyXsQnp5Nm3+fHT7fX274V2BMF7g8/PV+STL1vDQzszFQ23vhsDuxd1C+fmC+Jm1traYQdRFwwAAAhZJREFUOMtt0/dXEzEcAPCUtnbRgmxkj8djD/fee2vVOGptFVpF0epTFJXjlNZHF60sQfZysPf668hdkvZ61/x4+dw3yXcAEF5qTXXJjSuV1bFqEGWpsouulxffNH58dkF/rVKjEu/vyij/aao1P+LEqzfv9FnZkb8nHu16+PipQHw9kiIIotoZ8+LuHZFIkssE+0+eS8VuOY2RmFbXGE0kpZD7HbBZqPg1ZaptNVNxWMODU+/tVPhneqf/dXeGYmRxhyhqfhDxfWnNCSFs+9NBY+hjETA0fMBidZCF4+1D7QOwuxXFMHKiBOX36jci+lk4vOLv8nf2dpjMRJxWgqqaeizm1+DQaDP/FpJTJM7kgorLVl40zTqdbkfka5GQA8Ot27xoGYRzo5ZGscgHunuc+Nzg+Q1dXos4Y8Y8oHtABAJjNonIA5fuY8Eswq0Ju0Tkg4qLWDAB1rnZQsQnKopPgCrtSyw2gtA1wQmHIyxycoG67DUWI5Pj0BUYs3v7etzNVJxVAlD6lgjrOgsHggvD/9t6QjGKuGKdo6J+MshyxfrrttRhkcMVC2R+oWJkOeDz+fr7vDYiMviu2x8fElaGYTyeJnRTXuzFDQOStWGBMoZri0RMAm3auD3RxL7UUFvL4tIlwn4oVTCBquR4sTiYIIuYLUWmVijSdArJ8BaUlqVjcfKYoUAWbcCV5wt3oFV4XCn4uA0rkC+nnZTQTwAAAABJRU5ErkJggg==',
      async check() {
        const response = await httpRequest({
          method: 'GET',
          url: `https://skidka.ru/check_ali_affiliate?checkUrl=${encodeURIComponent((location.origin + location.pathname).replace('/i/', '/item/'))}`
        });

        if (response.status !== 200) {
          return null;
        }

        try {
          const res = JSON.parse(response.responseText);

          if (!res.isSuccess) {
            return null;
          }

          return {
            affiliate: res.isAffiliateItem,
            rate: `${res.CommissionRate}%`
          };
        } catch (e) {
          return null;
        }
      }
    }
  }

  const check = async () => {
    if (elementPrice) {
      elementPrice.removeEventListener('click', check);
      elementPrice.style.cursor = null;
      elementPrice.title = '';
    }

    const main = document.createElement('div');
    main.id = 'affiliate-checker';

    const style = document.createElement('style');
    style.innerHTML = `
      #affiliate-checker {
        width: 300px;
        max-width: 100%;
        margin: 8px 0;
        border: 1px solid #e3e3e3;
      }
      #affiliate-checker .affiliate-checker-item {
        display: flex;
        align-items: center;
      }
      #affiliate-checker .affiliate-checker-item:not(:first-child) {
        border-top: 1px solid #e3e3e3;
      }
      #affiliate-checker .affiliate-checker-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 2px solid #e3e3e3;
        background-color: #f2f2f2;
      }
      #affiliate-checker .affiliate-checker-icon a {
        padding: 4px;
        line-height: 0;
      }
      #affiliate-checker img {
        width: 16px;
        height: 16px;
      }
      #affiliate-checker .affiliate-checker-affiliate .affiliate-checker-info {
        background-color: ${config.colorAffiliate};
      }
      #affiliate-checker .affiliate-checker-not-affiliate .affiliate-checker-info {
        background-color: ${config.colorNotAffiliate};
      }
      #affiliate-checker .affiliate-checker-error .affiliate-checker-info {
        background-color: ${config.colorError};
      }
      #affiliate-checker .affiliate-checker-info {
        display: flex;
        flex-grow: 1;
        padding: 4px;
      }
      #affiliate-checker .affiliate-checker-status {
        flex-grow: 1;
      }
      #affiliate-checker .affiliate-checker-hot {
        padding-left: 4px;
      }
      #affiliate-checker .affiliate-checker-rate {
        padding-left: 4px;
        font-weight: bold;
      }
      .ms-block #affiliate-checker {
        margin-left: 16px;
      }
    `;

    document.head.appendChild(style);

    for (let s of config.services) {
      s = s.toLowerCase();

      if (!services[s]) {
        continue;
      }

      const item = document.createElement('div');
      item.innerHTML = `
        <div class="affiliate-checker-icon">
          <a href="${services[s].url}" target="_blank" rel="noopener">
            <img src="${services[s].icon}" title="${services[s].name}">
          </a>
        </div>
        <div class="affiliate-checker-info">
          <div class="affiliate-checker-status">Проверка...</div>
        </div>
      `;
      item.className = 'affiliate-checker-item';

      main.appendChild(item);

      services[s].check().then((res) => {
        const status = item.querySelector('.affiliate-checker-status');

        if (!res) {
          status.innerText = 'Не удалось проверить';
          item.classList.add('affiliate-checker-error');
          return;
        }

        const info = item.querySelector('.affiliate-checker-info');

        if (res.affiliate) {
          if (res.hot) {
            const div = document.createElement('div');
            div.className = 'affiliate-checker-hot';
            div.innerText = '🔥';

            info.appendChild(div);
          }
          if (res.rate) {
            const div = document.createElement('div');
            div.className = 'affiliate-checker-rate';
            div.innerText = res.rate;

            info.appendChild(div);
          }

          status.innerText = res.hot ? 'Повышенный кэшбэк' : 'Аффилиатный товар';
          item.classList.add('affiliate-checker-affiliate');
        } else {
          status.innerText = 'Неаффилиатный товар';
          item.classList.add('affiliate-checker-not-affiliate');
        }
      });
    }

    const links = main.querySelectorAll('a');

    links.forEach((link) => {
      link.addEventListener('click', () => {
        link.href = link.href.replace(/\?.+/, '');
      });
    });

    elementSibling.after(main);
  };

  const elementSibling = document.querySelector('.product-info .product-price, .detail-wrap .product-price-area, .detail-price-wish-wrap');
  const elementPrice = document.querySelector('.product-info .product-price-current, .detail-wrap .current-price, .detail-price-wish-wrap .current-price');

  if (elementSibling) {
    if (config.autoCheck) {
      check();
    } else {
      if (elementPrice) {
        elementPrice.addEventListener('click', check);
        elementPrice.style.cursor = 'pointer';
        elementPrice.title = 'Проверить аффилиатность товара';
      }
    }
  }
})();