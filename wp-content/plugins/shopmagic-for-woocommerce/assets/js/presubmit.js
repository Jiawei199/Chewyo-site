(($) => {
  if (typeof shopmagic_presubmit_params === 'undefined') {
    return false;
  }

  const {
    email_capture_selectors: emailFields,
    checkout_capture_selectors: checkoutFields,
    language,
    capture_email_url: captureEmailUrl,
    capture_checkout_field_url: captureCheckoutFieldUrl,
  } = shopmagic_presubmit_params;

  class CheckoutStrategy {
    constructor() {
      this.email = '';
      this.checkoutFieldsData = Object.fromEntries(checkoutFields.map(field => [field, '']));
      this.captureEmailXhr = null;
    }

    init() {
      throw new Error('init method must be implemented');
    }

    captureEmail(newEmail) {
      if (!newEmail || this.email === newEmail) {
        return;
      }

      this.email = newEmail;

      const data = {
        email: this.email,
        language,
        checkout_fields: this.getCheckoutFieldValues()
      };

      if (this.captureEmailXhr) {
        this.captureEmailXhr.abort();
      }

      this.captureEmailXhr = $.post(captureEmailUrl, data);
    }

    captureCheckoutField(fieldName, fieldValue) {
      if (!fieldName || !checkoutFields.includes(fieldName)) {
        return;
      }

      if (!fieldValue || this.checkoutFieldsData[fieldName] === fieldValue) {
        return;
      }

      this.checkoutFieldsData[fieldName] = fieldValue;

      $.post(captureCheckoutFieldUrl, {
        field_name: fieldName,
        field_value: fieldValue
      });
    }

    getCheckoutFieldValues() {
      throw new Error('getCheckoutFieldValues method must be implemented');
    }
  }

  class LegacyCheckoutStrategy extends CheckoutStrategy {
    constructor() {
      super();
      this.$checkoutForm = $('form.checkout');
    }

    init() {
      $(document).on('blur change', emailFields.join(', '), (e) => this.captureEmail(e.target.value));
      this.$checkoutForm.on('change', 'select', (e) => this.captureCheckoutField(e.target.name, e.target.value));
      this.$checkoutForm.on('blur change', '.input-text', (e) => this.captureCheckoutField(e.target.name, e.target.value));
    }

    getCheckoutFieldValues() {
      return Object.fromEntries(
        checkoutFields.map(
          fieldName => [
            fieldName,
            this.$checkoutForm.find(`[name="${fieldName}"]`).val()
          ]
        )
      );
    }
  }

  class BlockCheckoutStrategy extends CheckoutStrategy {
    init() {
      $(document).on('blur change', emailFields.join(', '), (e) => this.captureEmail(e.target.value));
      $(document).on(
        'blur change',
        '[class*="wc-block-components-address-form__"] input, [class*="wc-block-components-address-form__"] select',
        (e) => {
          const fieldName = this.getFieldNameFromClass(e.target);
          this.captureCheckoutField(fieldName, e.target.value);
        }
      );
    }

    /**
     * @param {HTMLElement} element
     */
    getFieldNameFromClass(element) {
      const containerElement = element.closest('[class*="wc-block-components-address-form__"');
      if (!containerElement) {
        return element.name;
      }

      const nameFromClass = [...containerElement.classList]
        .find(className => className.startsWith('wc-block-components-address-form__'))
        .replace('wc-block-components-address-form__', '');

      return nameFromClass || element.name;
    }

    getCheckoutFieldValues() {
      return Object.fromEntries(
        checkoutFields.map(
          fieldName => [
            fieldName,
            $(`[class*="wc-block-components-address-form__${fieldName}"] input, [class*="wc-block-components-address-form__${fieldName}"] select`).val()
          ]
        )
      );
    }
  }

  class CheckoutContext {
    constructor() {
      this.strategy = this.detectCheckoutType();
    }

    detectCheckoutType() {
      return $('.wc-block-checkout').length > 0
        ? new BlockCheckoutStrategy()
        : new LegacyCheckoutStrategy();
    }

    init() {
      this.strategy.init();
    }
  }

  $(document).on('init_checkout', () => {
    const checkoutContext = new CheckoutContext();
    checkoutContext.init();
  })
})(jQuery);
