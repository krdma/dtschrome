(function () {
  const BUTTON_CLASS = "dts-login-autofill-btn";
  const PROCESSED_FORM_ATTR = "data-dts-login-autofill";
  const API_ENDPOINT = "https://dshb.gth.com.ua/secrets?domain=";
  const credentialCache = new Map();
  const DECRYPTION_SEED = "df6de254556449fc893f77d719f37a04"; // Must match the phrase that was used on the server side.

  const base64ToUint8Array = (b64) => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const concatUint8Arrays = (a, b) => {
    const combined = new Uint8Array(a.length + b.length);
    combined.set(a, 0);
    combined.set(b, a.length);
    return combined;
  };

  const decryptWithSeed = async (b64payload, seed) => {
    const data = base64ToUint8Array(b64payload);
    console.log(data); 
    const saltLen = 16;
    const ivLen = 12;
    const tagLen = 16;

    if (data.length < saltLen + ivLen + tagLen) {
      throw new Error("Payload too short");
    }

    const salt = data.slice(0, saltLen);
    const iv = data.slice(saltLen, saltLen + ivLen);
    const tag = data.slice(saltLen + ivLen, saltLen + ivLen + tagLen);
    const ciphertext = data.slice(saltLen + ivLen + tagLen);

    const cipherPlusTag = concatUint8Arrays(ciphertext, tag);

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(seed),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const iterations = 200000;
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const plaintextBuf = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: 128,
      },
      key,
      cipherPlusTag
    );

    return new TextDecoder().decode(plaintextBuf);
  };

  const decodeSecret = async (secret, seedOverride) => {
    if (typeof secret !== "string" || !secret) {
      return "";
    }

    const seed = seedOverride || DECRYPTION_SEED;
    if (!seed) {
      console.warn(
        "[DTS Autofill] Decryption seed is not configured, skipping password"
      );
      return "";
    }

    if (!crypto?.subtle) {
      console.warn("[DTS Autofill] Web Crypto API is not available");
      return "";
    }

    try {
      return await decryptWithSeed(secret, seed);
    } catch (error) {
      console.warn("[DTS Autofill] Unable to decrypt secret", error);
      return "";
    }
  };

  const disableAutocomplete = (element) => {
    if (!element) {
      return;
    }

    element.setAttribute("autocomplete", "off");
    element.setAttribute("data-dts-autocomplete", "off");
  };

  const dispatchInputEvents = (element) => {
    if (!element) {
      return;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const scoreField = (element) => {
    if (!element) {
      return -1;
    }

    let score = 0;
    const attributes = `${element.name || ""} ${element.id || ""} ${
      element.placeholder || ""
    }`.toLowerCase();

    if (element.type === "email") {
      score += 5;
    }

    if (attributes.includes("email")) {
      score += 4;
    }

    if (attributes.includes("user")) {
      score += 3;
    }

    if (attributes.includes("login")) {
      score += 3;
    }

    if (attributes.includes("name")) {
      score += 1;
    }

    return score;
  };

  const findUsernameField = (form) => {
    const selectors = [
      "input[type='email']",
      "input[type='username']",
      "input[type='text']",
      "input[type='tel']",
      "input[type='number']",
      "input:not([type])",
    ];

    const fields = selectors
      .map((selector) => Array.from(form.querySelectorAll(selector)))
      .flat()
      .filter(
        (field) =>
          field &&
          field.type !== "password" &&
          field.type !== "hidden" &&
          !field.disabled
      );

    if (fields.length === 0) {
      return null;
    }

    const visibleFields = fields.filter((field) => {
      if (field.offsetParent !== null) {
        return true;
      }

      const style = window.getComputedStyle(field);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    });

    const candidateFields = visibleFields.length > 0 ? visibleFields : fields;

    candidateFields.sort((a, b) => scoreField(b) - scoreField(a));

    return candidateFields[0] || null;
  };

  const sendRuntimeMessage = async (message) => {
    if (!chrome?.runtime?.sendMessage) {
      throw new Error("Chrome runtime messaging is not available");
    }

    const response = await chrome.runtime.sendMessage(message);
    if (typeof response === "undefined" || response === null) {
      throw new Error("Empty response from background script");
    }

    return response;
  };

  const fetchCredentials = async (domain) => {
    if (!domain) {
      throw new Error("Domain is required");
    }

    const cached = credentialCache.get(domain);
    if (cached) {
      return cached;
    }

    const request = sendRuntimeMessage({
      action: "fetch",
      url: `${API_ENDPOINT}${encodeURIComponent(domain)}`,
    })
      .then(async (response) => {
        if (!response.ok) {
          const statusMessage =
            typeof response.status !== "undefined" ? ` ${response.status}` : "";
          const errorMessage =
            response.error || `Request failed with status${statusMessage}`;
          throw new Error(errorMessage);
        }

        const payload = response.data;
        if (!Array.isArray(payload) || payload.length === 0) {
          throw new Error("Credentials not found");
        }

        const exactMatch = payload.find(
          (item) => item && item.domain === domain
        );
        const record = exactMatch || payload[0];

        const passwordSeed =
          record?.seed_phrase ||
          record?.seedPhrase ||
          record?.seed ||
          record?.passphrase ||
          "";
        const password = await decodeSecret(
          record?.secret_value || "",
          passwordSeed
        );

        return {
          username: record?.username || "",
          password,
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
    if (typeof text === "string") {
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
      setButtonState(button, { disabled: false, text: "Не найдено" });
      return;
    }

    setButtonState(button, { disabled: true, text: "Загрузка…" });

    try {
      const domain = window.location.hostname;
      const { username, password } = await fetchCredentials(domain);

      if (!username && !password) {
        throw new Error("Пустые данные");
      }
      usernameField.value = username || "";
      passwordField.value = "";
      dispatchInputEvents(usernameField);
      dispatchInputEvents(passwordField);

      disableAutocomplete(usernameField);
      disableAutocomplete(passwordField);
      disableAutocomplete(form);

      usernameField.value = username || "";
      passwordField.value = password || "";

      dispatchInputEvents(usernameField);
      dispatchInputEvents(passwordField);

      setButtonState(button, { disabled: false, text: "Готово" });
      setTimeout(
        () => setButtonState(button, { disabled: false, text: "Заполнить" }),
        2000
      );
    } catch (error) {
      console.warn("[DTS Autofill] Failed to fill credentials", error);
      setButtonState(button, { disabled: false, text: "Ошибка" });
      setTimeout(
        () => setButtonState(button, { disabled: false, text: "Заполнить" }),
        2000
      );
    }
  };

  const createButton = (form) => {
    if (!form || form.querySelector(`button.${BUTTON_CLASS}`)) {
      return null;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Заполнить";
    button.className = BUTTON_CLASS;
    button.style.marginTop = "8px";
    button.style.marginBottom = "8px";
    button.style.padding = "6px 12px";
    button.style.cursor = "pointer";

    const passwordField = form.querySelector("input[type='password']");
    if (passwordField) {
      form.appendChild(button);
      document.querySelectorAll('form svg').forEach(el => el.remove());
    } else {
      form.appendChild(button);
    }
    const btn = document.getElementById("togglePassword");
    if (btn) btn.remove();
    button.addEventListener("click", () => handleButtonClick(form, button));

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
      form.setAttribute(PROCESSED_FORM_ATTR, "true");
    }
  };

  const enhanceAllForms = () => {
    const forms = Array.from(document.querySelectorAll("form"));
    forms.forEach(enhanceForm);
  };

  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;
    for (const mutation of mutations) {
      if (
        mutation.type === "childList" &&
        (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
      ) {
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
        subtree: true,
      });
    } catch (error) {
      console.warn("[DTS Autofill] Unable to observe mutations", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
