(function () {
  const BUTTON_CLASS = 'dts-login-autofill-btn';
  const PROCESSED_FORM_ATTR = 'data-dts-login-autofill';
  const API_ENDPOINT = 'https://cp.gth.com.ua/secrets?domain=';
  const credentialCache = new Map();

  const decodeSecret = (secret) => {
    if (typeof secret !== 'string') {
      return '';
    }

    try {
      const binary = atob(secret);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      try {
        return atob(secret);
      } catch (innerError) {
        console.warn('[DTS Autofill] Unable to decode secret', innerError);
        return '';
      }
    }
  };

  const disableAutocomplete = (element) => {
    if (!element) {
      return;
    }

    element.setAttribute('autocomplete', 'off');
    element.setAttribute('data-dts-autocomplete', 'off');
  };

  const dispatchInputEvents = (element) => {
    if (!element) {
      return;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const scoreField = (element) => {
    if (!element) {
      return -1;
    }

    let score = 0;
    const attributes = `${element.name || ''} ${element.id || ''} ${element.placeholder || ''}`.toLowerCase();

    if (element.type === 'email') {
      score += 5;
    }

    if (attributes.includes('email')) {
      score += 4;
    }

    if (attributes.includes('user')) {
      score += 3;
    }

    if (attributes.includes('login')) {
      score += 3;
    }

    if (attributes.includes('name')) {
      score += 1;
    }

    return score;
  };

  const findUsernameField = (form) => {
    const selectors = [
      "input[type='email']",
      "input[type='text']",
      "input[type='tel']",
      "input[type='number']",
      'input:not([type])'
    ];

    const fields = selectors
      .map((selector) => Array.from(form.querySelectorAll(selector)))
      .flat()
      .filter((field) => field && field.type !== 'password' && field.type !== 'hidden' && !field.disabled);

    if (fields.length === 0) {
      return null;
    }

    const visibleFields = fields.filter((field) => {
      if (field.offsetParent !== null) {
        return true;
      }

      const style = window.getComputedStyle(field);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });

    const candidateFields = visibleFields.length > 0 ? visibleFields : fields;

    candidateFields.sort((a, b) => scoreField(b) - scoreField(a));

    return candidateFields[0] || null;
  };

  const fetchCredentials = async (domain) => {
    if (!domain) {
      throw new Error('Domain is required');
    }

    const cached = credentialCache.get(domain);
    if (cached) {
      return cached;
    }

    const request = fetch(`${API_ENDPOINT}${encodeURIComponent(domain)}`, {
      credentials: 'include'
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (!Array.isArray(payload) || payload.length === 0) {
          throw new Error('Credentials not found');
        }

        const exactMatch = payload.find((item) => item && item.domain === domain);
        const record = exactMatch || payload[0];

        return {
          username: record?.username || '',
          password: decodeSecret(record?.secret_value || '')
        };
      })
      .catch((error) => {
        credentialCache.delete(domain);
        throw error;
      });

    credentialCache.set(domain, request);
    return request;
  };

  const setButtonState = (button, { disabled, text }) => {
    if (!button) {
      return;
    }

    button.disabled = Boolean(disabled);
    if (typeof text === 'string') {
      button.textContent = text;
    }
  };

  const handleButtonClick = async (form, button) => {
    if (!form || !button) {
      return;
    }

    const passwordField = form.querySelector("input[type='password']");
    const usernameField = findUsernameField(form);

    if (!passwordField || !usernameField) {
      setButtonState(button, { disabled: false, text: 'Не найдено' });
      return;
    }

    setButtonState(button, { disabled: true, text: 'Загрузка…' });

    try {
      const domain = window.location.hostname;
      const { username, password } = await fetchCredentials(domain);

      if (!username && !password) {
        throw new Error('Пустые данные');
      }

      usernameField.value = username || '';
      passwordField.value = password || '';

      disableAutocomplete(usernameField);
      disableAutocomplete(passwordField);
      disableAutocomplete(form);

      dispatchInputEvents(usernameField);
      dispatchInputEvents(passwordField);

      setButtonState(button, { disabled: false, text: 'Готово' });
      setTimeout(() => setButtonState(button, { disabled: false, text: 'Заполнить' }), 2000);
    } catch (error) {
      console.warn('[DTS Autofill] Failed to fill credentials', error);
      setButtonState(button, { disabled: false, text: 'Ошибка' });
      setTimeout(() => setButtonState(button, { disabled: false, text: 'Заполнить' }), 2000);
    }
  };

  const createButton = (form) => {
    if (!form || form.querySelector(`button.${BUTTON_CLASS}`)) {
      return null;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Заполнить';
    button.className = BUTTON_CLASS;
    button.style.marginTop = '8px';
    button.style.marginBottom = '8px';
    button.style.padding = '6px 12px';
    button.style.cursor = 'pointer';

    const passwordField = form.querySelector("input[type='password']");
    if (passwordField) {
      passwordField.insertAdjacentElement('afterend', button);
    } else {
      form.appendChild(button);
    }

    button.addEventListener('click', () => handleButtonClick(form, button));

    return button;
  };

  const enhanceForm = (form) => {
    if (!form || form.hasAttribute(PROCESSED_FORM_ATTR)) {
      return;
    }

    const passwordField = form.querySelector("input[type='password']");
    if (!passwordField) {
      return;
    }

    disableAutocomplete(form);
    disableAutocomplete(passwordField);

    const usernameField = findUsernameField(form);
    disableAutocomplete(usernameField);

    const button = createButton(form);
    if (button) {
      form.setAttribute(PROCESSED_FORM_ATTR, 'true');
    }
  };

  const enhanceAllForms = () => {
    const forms = Array.from(document.querySelectorAll('form'));
    forms.forEach(enhanceForm);
  };

  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
        shouldRescan = true;
        break;
      }
    }

    if (shouldRescan) {
      enhanceAllForms();
    }
  });

  const start = () => {
    enhanceAllForms();

    try {
      observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
      });
    } catch (error) {
      console.warn('[DTS Autofill] Unable to observe mutations', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
