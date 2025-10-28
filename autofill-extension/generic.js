(() => {
  const allowedDomains = ['example.com'];
  const common = window.autofillCommon || {};

  const setFieldValue =
    typeof common.setValue === 'function'
      ? common.setValue
      : (input, value) => {
          if (!input) return;
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
        };

  function toPercentEncoded(str) {
    return Array.from(str)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('');
  }

  function decodeSecretValue(value) {
    if (!value) return '';
    const normalized = value.replace(/\s+/g, '');
    try {
      const decoded = atob(normalized);
      try {
        return decodeURIComponent(toPercentEncoded(decoded));
      } catch (err) {
        return decoded;
      }
    } catch (err) {
      console.error('Failed to decode secret value', err);
      return '';
    }
  }

  async function requestCredentials(domain) {
    const url = `https://cp.gth.com.ua/secrets?domain=${encodeURIComponent(domain)}`;
    try {
      let response = null;
      if (chrome?.runtime?.sendMessage) {
        response = await chrome.runtime.sendMessage({ action: 'fetch', url });
      } else {
        const res = await fetch(url);
        const data = await res.json();
        response = { ok: res.ok, status: res.status, data };
      }
      if (!response?.ok) {
        throw new Error(`Failed to load credentials (${response?.status || 'no status'})`);
      }
      const records = Array.isArray(response.data) ? response.data : [];
      const lowerDomain = domain.toLowerCase();
      return (
        records.find((item) => (item.domain || '').toLowerCase() === lowerDomain) ||
        records[0] ||
        null
      );
    } catch (err) {
      console.error('Failed to fetch credentials for domain', domain, err);
      throw err;
    }
  }

  function isVisible(input) {
    if (!input) return false;
    if (input.type === 'hidden' || input.disabled) return false;
    const rects = input.getClientRects();
    return rects.length > 0 && rects[0].width > 0 && rects[0].height > 0;
  }

  function findUsernameInput(form) {
    if (!form) return null;
    const selectors = [
      "input[name*='user' i]",
      "input[name*='login' i]",
      "input[name*='email' i]",
      "input[type='email']",
      "input[type='text']",
      'input:not([type])'
    ];
    const invalidTypes = new Set([
      'password',
      'submit',
      'button',
      'checkbox',
      'radio',
      'file',
      'search',
      'hidden',
      'reset'
    ]);

    for (const selector of selectors) {
      const candidates = Array.from(form.querySelectorAll(selector));
      for (const candidate of candidates) {
        const type = (candidate.getAttribute('type') || '').toLowerCase();
        if (invalidTypes.has(type)) continue;
        if (!isVisible(candidate)) continue;
        return candidate;
      }
    }
    return null;
  }

  function createLoginButton() {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'flex-end';
    wrapper.style.marginTop = '8px';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'заполнить';
    button.className = 'autofill-login-button';
    button.style.cursor = 'pointer';
    button.style.padding = '6px 12px';
    button.style.borderRadius = '4px';
    button.style.border = '1px solid #3f51b5';
    button.style.background = '#3f51b5';
    button.style.color = '#fff';

    wrapper.appendChild(button);
    return { wrapper, button };
  }

  function enhanceLoginForm(form) {
    const passwordInputs = Array.from(form.querySelectorAll("input[type='password']"));
    if (!passwordInputs.length) return;
    if (form.dataset.autofillLoginAttached === 'true') return;
    form.dataset.autofillLoginAttached = 'true';

    passwordInputs.forEach((input) => {
      input.setAttribute('autocomplete', 'new-password');
    });
    const primaryPasswordInput = passwordInputs[0];

    const { wrapper, button } = createLoginButton();
    const anchor = primaryPasswordInput.closest('div, fieldset, section, label, p') || primaryPasswordInput;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(wrapper, anchor.nextSibling);
    } else if (form) {
      form.appendChild(wrapper);
    }

    const defaultText = button.textContent;

    button.addEventListener('click', async () => {
      if (button.dataset.loading === 'true') return;
      button.dataset.loading = 'true';
      button.disabled = true;
      button.textContent = 'Загрузка...';

      try {
        const credentials = await requestCredentials(location.hostname);
        if (!credentials) {
          button.textContent = 'Нет данных';
          return;
        }

        const usernameInput = findUsernameInput(form);
        if (usernameInput && credentials.username) {
          setFieldValue(usernameInput, credentials.username);
          usernameInput.setAttribute('autocomplete', 'username');
        }

        const password = decodeSecretValue(credentials.secret_value);
        if (password) {
          passwordInputs.forEach((input) => setFieldValue(input, password));
        }

        button.textContent = 'Заполнено';
      } catch (err) {
        button.textContent = 'Ошибка';
      } finally {
        setTimeout(() => {
          button.textContent = defaultText;
          button.dataset.loading = 'false';
          button.disabled = false;
        }, 2000);
      }
    });
  }

  function initLoginAutofill() {
    const processRoot = (root) => {
      if (!root) return;
      const forms = [];
      if (root instanceof HTMLFormElement) {
        forms.push(root);
      }
      if (root.querySelectorAll) {
        forms.push(...root.querySelectorAll('form'));
      }
      forms.forEach((form) => {
        if (form.querySelector("input[type='password']")) {
          enhanceLoginForm(form);
        }
      });
    };

    processRoot(document);

    if (!document.body) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processRoot(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initBookingAutofill() {
    if (!allowedDomains.some((domain) => location.hostname.includes(domain))) {
      return;
    }

    const {
      passengers = [],
      setValue,
      setValueByName,
      setDropdown,
      setGender,
      getContactInfo,
      createButton
    } = common;

    if (typeof createButton !== 'function') return;
    const applyValue = typeof setValue === 'function' ? setValue : setFieldValue;

    function setBasicDropdown(dropdown, value) {
      if (!dropdown) return;
      const input = dropdown.querySelector("input[id^='dropdown_']") || dropdown.previousElementSibling;
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      const span = dropdown.querySelector('span');
      if (span) span.textContent = value;
    }

    function fillBookingInfoForm(data) {
      const form = document.getElementById('booking-info-search-form');
      if (!form) return false;

      const pax = data && data.passports ? data.passports : passengers;
      const contact = getContactInfo ? getContactInfo(data || {}) : {};

      const contactHeader = Array.from(form.querySelectorAll('h1,h2,h3,h4,h5,h6')).find((h) =>
        /контакт/i.test(h.textContent || '')
      );
      const contactSection = contactHeader ? contactHeader.parentElement : null;

      const firstInputs = Array.from(form.querySelectorAll("input[name='firstname']"));
      const lastInputs = Array.from(form.querySelectorAll("input[name='lastname']"));

      firstInputs.forEach((input, idx) => {
        if (contactSection && contactSection.contains(input)) return;
        const p = pax[idx] || pax[0];
        if (!p) return;
        applyValue(input, p.first_name || p.firstName);
        const block = input.closest('div');
        const dd = block ? block.querySelector("[data-testid='basicDropdown']") : null;
        setBasicDropdown(dd, p.gender === 'FEMALE' ? 'Г-жа' : 'Г-н');
      });

      lastInputs.forEach((input, idx) => {
        if (contactSection && contactSection.contains(input)) return;
        const p = pax[idx] || pax[0];
        if (!p) return;
        applyValue(input, p.last_name || p.lastName);
      });

      if (contactSection) {
        setBasicDropdown(
          contactSection.querySelector("[data-testid='basicDropdown']"),
          contact.title === 'MS' || contact.title === 'MRS' ? 'Г-жа' : 'Г-н'
        );
        applyValue(contactSection.querySelector("input[name='firstname']"), contact.firstName);
        applyValue(contactSection.querySelector("input[name='lastname']"), contact.lastName);
        applyValue(contactSection.querySelector("input[type='email']"), contact.email);
        const phoneInput = contactSection.querySelector("input[type='tel']");
        if (phoneInput) applyValue(phoneInput, contact.phone);
      }

      return true;
    }

    function findContactSection() {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const h of headings) {
        const txt = h.textContent || '';
        if (/контакт/i.test(txt) || /contact/i.test(txt)) {
          return h.closest('form') || h.parentElement;
        }
      }
      return null;
    }

    function fillContactSection(contact, section) {
      if (!section) return;
      if (setDropdown) setDropdown(section.querySelector('select'), contact.title || 'MR');
      applyValue(
        section.querySelector("input[name='firstname'], input[name*='first']"),
        contact.firstName
      );
      applyValue(
        section.querySelector("input[name='lastname'], input[name*='last']"),
        contact.lastName
      );
      applyValue(section.querySelector("input[type='email']"), contact.email);
      applyValue(section.querySelector("input[type='tel']"), contact.phone);
    }

    function fillGeneric(data) {
      if (fillBookingInfoForm(data)) return;

      const pax = data && data.passports ? data.passports : passengers;
      const contact = getContactInfo ? getContactInfo(data || {}) : {};
      const contactSection = findContactSection();

      pax.forEach((p, idx) => {
        const first = p.first_name || p.firstName;
        const last = p.last_name || p.lastName;
        setValueByName && setValueByName(`form.passengers.ADT-${idx}.name`, first);
        setValueByName && setValueByName(`form.passengers.ADT-${idx}.surname`, last);
        if (idx === 0) {
          setValueByName && setValueByName(`form.passengers.ADT-${idx}.email`, contact.email);
          setValueByName && setValueByName(`form.passengers.ADT-${idx}.phone`, contact.phone);
        }
      });

      const firstInputs = document.querySelectorAll("input[name*='first']");
      firstInputs.forEach((el, idx) => {
        if (contactSection && contactSection.contains(el)) return;
        const p = pax[idx] || pax[0];
        if (!p) return;
        const first = p.first_name || p.firstName;
        applyValue(el, first);
      });

      const lastInputs = document.querySelectorAll("input[name*='last']");
      lastInputs.forEach((el, idx) => {
        if (contactSection && contactSection.contains(el)) return;
        const p = pax[idx] || pax[0];
        if (!p) return;
        const last = p.last_name || p.lastName;
        applyValue(el, last);
      });

      const emailInput = document.querySelector("input[type='email']");
      if (emailInput && (!contactSection || !contactSection.contains(emailInput))) {
        applyValue(emailInput, contact.email);
      }

      const phoneInput = document.querySelector("input[type='tel']");
      if (phoneInput && (!contactSection || !contactSection.contains(phoneInput))) {
        applyValue(phoneInput, contact.phone);
      }

      fillContactSection(contact, contactSection);

      const titleField = document.querySelector("select[name*='title']");
      if (titleField && setDropdown) setDropdown(titleField, 'MR');
      const genderField = document.querySelector("select[name*='gender']");
      if (genderField && setGender) setGender(genderField);
    }

    createButton(fillGeneric);
  }

  function onReady() {
    initLoginAutofill();
    initBookingAutofill();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();

