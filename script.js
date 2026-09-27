/*
 * ДАННЫЕ ДЛЯ ПУБЛИКАЦИИ: заполните этот объект реальными контактами.
 * whatsapp: полная ссылка вида https://wa.me/77001234567
 * email: рабочий адрес для заявок. Если WhatsApp и email пустые,
 * форма проверяет поля и предлагает скопировать текст, но не отправляет его.
 */
const SITE = {
  company: 'zapchasti',
  cities: '[ГОРОДА]',
  phone: '',
  whatsapp: '',
  email: ''
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

$$('[data-company]').forEach((node) => { node.textContent = SITE.company; });
$$('[data-cities]').forEach((node) => { node.textContent = SITE.cities; });
$$('[data-phone]').forEach((node) => { node.textContent = SITE.phone || '[ТЕЛЕФОН]'; });
$$('[data-email]').forEach((node) => { node.textContent = SITE.email || '[EMAIL]'; });
$$('[data-phone-link]').forEach((node) => {
  if (SITE.phone) node.href = `tel:${SITE.phone.replace(/[^+\d]/g, '')}`;
});
if (!SITE.phone && $('.header-phone')) $('.header-phone').hidden = true;
$$('[data-email-link]').forEach((node) => {
  if (SITE.email) node.href = `mailto:${SITE.email}`;
});
if ($('#year')) $('#year').textContent = new Date().getFullYear();
document.title = `${SITE.company} — автозапчасти из Китая и ОАЭ`;

const toast = $('#site-toast');
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
}

function whatsappLink(message) {
  if (!SITE.whatsapp) return null;
  try {
    const url = new URL(SITE.whatsapp);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (message) url.searchParams.set('text', message);
    return url.toString();
  } catch { return null; }
}

$$('.js-whatsapp').forEach((link) => {
  const url = whatsappLink('Здравствуйте! Хочу подобрать запчасть.');
  if (url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('WhatsApp пока не подключён. Заполните заявку ниже — её можно будет скопировать.');
      $('#request')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

const menuButton = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
}
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });
}

const form = $('#request-form');
const partField = $('#part');
const commentField = $('#comment');
$$('[data-part]').forEach((link) => link.addEventListener('click', () => {
  if (partField) partField.value = link.dataset.part;
}));
$$('[data-source]').forEach((link) => link.addEventListener('click', () => {
  if (commentField && !commentField.value.includes('Направление:')) {
    commentField.value = `Направление: ${link.dataset.source}${commentField.value ? `\n${commentField.value}` : ''}`;
  }
}));

if (form) {
  const fields = {
    name: $('#customer-name'), phone: $('#customer-phone'),
    vehicle: $('#vehicle'), part: $('#part'), comment: $('#comment'), consent: $('#consent')
  };
  const status = $('#form-status');
  const copyButton = $('#copy-request');
  let requestText = '';

  function errorFor(key, message) {
    const input = fields[key];
    const error = $(`#${key}-error`);
    if (!input || !error) return;
    error.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) input.setAttribute('aria-describedby', `${key}-error`);
    else input.removeAttribute('aria-describedby');
  }
  function validate() {
    const name = fields.name.value.trim();
    const phone = fields.phone.value.replace(/\D/g, '');
    const vehicle = fields.vehicle.value.trim();
    const part = fields.part.value.trim();
    const phoneValid = (phone.length === 11 && /^[78]/.test(phone)) || phone.length === 10;
    const errors = {
      name: name.length < 2 ? 'Укажите имя — минимум 2 символа.' : '',
      phone: phoneValid ? '' : 'Укажите номер телефона в формате +7 777 000 00 00.',
      vehicle: vehicle.length < 2 ? 'Укажите VIN или марку и модель автомобиля.' : '',
      part: part.length < 2 ? 'Напишите, какая деталь нужна.' : '',
      comment: '',
      consent: fields.consent.checked ? '' : 'Подтвердите согласие на обработку данных.'
    };
    Object.entries(errors).forEach(([key, message]) => errorFor(key, message));
    const firstInvalid = Object.keys(errors).find((key) => errors[key]);
    if (firstInvalid) fields[firstInvalid].focus();
    return !firstInvalid;
  }
  Object.entries(fields).forEach(([key, input]) => {
    if (!input) return;
    input.addEventListener(key === 'consent' ? 'change' : 'input', () => errorFor(key, ''));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.hidden = true;
    copyButton.hidden = true;
    if (!validate()) return;

    requestText = [
      'Здравствуйте! Нужен подбор запчасти.',
      `Имя: ${fields.name.value.trim()}`,
      `Телефон: ${fields.phone.value.trim()}`,
      `VIN / автомобиль: ${fields.vehicle.value.trim()}`,
      `Деталь: ${fields.part.value.trim()}`,
      fields.comment.value.trim() ? `Комментарий: ${fields.comment.value.trim()}` : ''
    ].filter(Boolean).join('\n');

    const url = whatsappLink(requestText);
    status.classList.remove('is-warning');
    status.hidden = false;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      status.textContent = 'Заявка подготовлена. Отправьте сообщение в открывшемся окне WhatsApp.';
      copyButton.hidden = false;
    } else if (SITE.email) {
      const subject = encodeURIComponent('Заявка на подбор запчасти');
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${encodeURIComponent(requestText)}`;
      status.textContent = 'Заявка подготовлена. Отправьте письмо в открывшемся почтовом приложении.';
      copyButton.hidden = false;
    } else {
      status.classList.add('is-warning');
      status.textContent = 'Данные проверены, но канал отправки пока не настроен. Скопируйте текст заявки и отправьте его вручную.';
      copyButton.hidden = false;
    }
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(requestText);
      copyButton.textContent = 'Текст скопирован';
    } catch {
      const helper = document.createElement('textarea');
      helper.value = requestText;
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      copyButton.textContent = copied ? 'Текст скопирован' : 'Не удалось скопировать — выделите текст вручную';
    }
  });
}
