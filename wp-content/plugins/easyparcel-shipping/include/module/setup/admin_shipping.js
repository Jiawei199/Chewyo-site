jQuery(window).on("load", function () {
    jQuery('#woocommerce_easyparcel_integration_id').after(
        `<button style="margin-left: 5px;" id="ep_verify_btn" class="button" type="button" onclick="getDefaultSenderAddrApiVersion('api_changed')">Verify</button>`
    )
	addFeedbackBanner();
	updateCurrencyField();
	init();
});

function getDefaultSenderAddrApiVersion(trigger) {
    const api     = jQuery('#woocommerce_easyparcel_integration_id').val();
    const country = jQuery('#woocommerce_easyparcel_sender_country').val();

    if (!api) {
        alert('Please fill in integration id first.');
        return;
    }

    if (!country) {
        alert('Please select a country first.');
        return;
    }

    // show loader
    jQuery('.loading_bar').remove();
    jQuery('#ep_verify_btn')
        .after('<div class="loading_bar"><div class="loader"></div></div>');

	// disable address buttons
    jQuery('button')
        .prop('disabled', true);

	// get api version and default address
    jQuery.ajax({
        url: ajaxurl,
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'get_easyparcel_default_address_api_version',
            api,
            country,
            nonce
        },

        success(response) {
            if (!response || !response.api_version || !response.address) {
                console.error('EasyParcel API response:', response);
                let errorMsg = 'Invalid response from server.';
                if (!response) {
                    errorMsg += ' Empty response received.';
                } else if (!response.api_version) {
                    errorMsg += ' Could not retrieve API version. Please check your Integration ID and ensure the EasyParcel API is reachable.';
                } else if (!response.address) {
                    errorMsg += ' Could not retrieve address data.';
                }
                alert(errorMsg);
                return;
            }

            const api_version = response.api_version;
            const addr = response.address.result || {};

            // ---------- API version render ----------
            let badge_color = '';
            let badge_text  = '';

            if (api_version === 'Next Gen') {
                badge_color = '#28a745';
                badge_text  = 'NextGen';
            } else {
                badge_color = '#007bff';
                badge_text  = 'Classic';
            }

            const badge_html = `<span id='api_version' style='background-color: ${badge_color}; color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 14px; font-weight: bold; margin-left: 8px;'>${badge_text}</span>`
			let api_version_html = "API Version: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + badge_html; 
			api_version_html +="<br><br><small>Please take note, after changing the version, you need to reset the preferred courier and preferred drop off point of the auto fulfilment.</small>";

            const nextgen_link =
                country === 'SG'
                    ? 'https://github.com/easyparcel/nextgen-integration-doc/blob/main/IronManSwitches/Shopify_SG.md'
                    : 'https://github.com/easyparcel/nextgen-integration-doc/blob/main/IronManSwitches/Shopify_MY.md';

            if (api_version === 'Classic') {
                api_version_html += `<br><small>To change to NextGen version, you can refer <a href="${nextgen_link}" target="_blank">here</a>.</small>`;
            }

            jQuery('#woocommerce_easyparcel_api_version').html(api_version_html);


            // ---------- Insert default address ----------
			const sender_addresses = getSenderAddressList() || [];
			if(trigger == "api_changed") {
				// if api changed, only prompt user when no address
				if (sender_addresses.length > 0) return;

				if (!confirm('Do you wish to load your Easyparcel default address to sender address list?')) {
					return;
				}
			}
            

            jQuery('#woocommerce_easyparcel_easyparcel_email').val(addr.Email || '');


            if (
                addr.Name &&
                addr.Contact &&
                addr.Address_1 &&
                addr.Town &&
                addr.State &&
                addr.Postcode
            ) {
				// ensure unique address label
				const existingLabels = new Set(sender_addresses.map(a => a.label));

				let i = 1;
				let newLabel;

				do {
					newLabel = `Address ${i++}`;
				} while (existingLabels.has(newLabel));

				// insert address loaded as another address
                sender_addresses.push({
                    label: newLabel,
                    name: addr.Name,
                    phone: addr.Contact,
                    alt_phone: addr.Phone || '',
                    company_name: addr.Company || '',
                    addr1: addr.Address_1,
                    addr2: addr.Address_2 || '',
                    city: addr.Town,
                    state_zone: addr.State,
                    postcode: addr.Postcode,
                    country
                });
            }

			saveSenderAddressList(sender_addresses);
        },

        error(jqXHR, textStatus, errorThrown) {
            console.error('EasyParcel AJAX error:', textStatus, errorThrown, jqXHR.responseText);
            alert('Failed to load default address. ' + textStatus + ': ' + errorThrown);
        },

        complete() {
            jQuery('.loading_bar').remove();
            jQuery('button')
                .prop('disabled', false);
        }
    });
}

jQuery(document).ready(function () {
	
	jQuery("select#woocommerce_easyparcel_sender_country").change(function (e, trigger = true) {
		init();
	});

	jQuery("#woocommerce_easyparcel_enabled").change(function () {
		init();
	});
});

function init() {
	updateCurrencyField();
	var selected = jQuery("select#woocommerce_easyparcel_sender_country").find(":selected").val();
	if (selected != "NONE" && jQuery("#woocommerce_easyparcel_enabled").is(":checked")) {
		showdetails(selected);
		if (obj.sender_state != null) {
			jQuery("select#woocommerce_easyparcel_sender_state").val(obj.sender_state);
		}
		if (obj.courier_service != null) {
			jQuery("select#woocommerce_easyparcel_courier_service").val(obj.courier_service);
		}
	} else {
		hidedetails(selected);
	}
}

   function updateCurrencyField() {
        var senderCountry = jQuery('#woocommerce_easyparcel_sender_country').val();
        
        // Handle case where sender_country might not be selected yet
        if (!senderCountry || senderCountry === 'NONE') {
            senderCountry = 'MY'; // Default to MY
        }
        
        var epCurrency = (senderCountry === 'SG') ? 'SGD' : 'MYR';
        var storeCurrency = epSettings.storeCurrency; // Access the PHP value here
        
        // Update currency text in description spans
        jQuery('#ep-currency-target, #ep-currency-target-2, #ep-currency-target-3').text(epCurrency);
        
        // Get the conversion rate field row
        var $conversionRateRow = jQuery('#woocommerce_easyparcel_conversion_rate').closest('tr');
        
        // Show/hide based on currency match
        if (storeCurrency === epCurrency) {
            $conversionRateRow.hide();
			jQuery('#woocommerce_easyparcel_currency_conversion_setting').hide();
        } else {
            $conversionRateRow.show();
			jQuery('#woocommerce_easyparcel_currency_conversion_setting').show();
        }
    }

function hidedetails(country) {
	jQuery("#woocommerce_easyparcel_sender_detail").hide();
	jQuery("#woocommerce_easyparcel_easyparcel_email").closest("tr").hide();
	jQuery("#woocommerce_easyparcel_integration_id").closest("tr").hide();
	jQuery("#woocommerce_easyparcel_courier_service").closest("tr").hide();
	// jQuery("#woocommerce_easyparcel_enabled").closest("tr").hide();

	jQuery("#woocommerce_easyparcel_order_status_update_setting").hide();
	jQuery("#woocommerce_easyparcel_order_status_update_option").closest("tr").hide();

	jQuery("#woocommerce_easyparcel_addon_service_setting").hide();
	jQuery("#woocommerce_easyparcel_addon_email_option").closest("tr").hide();
	jQuery("#woocommerce_easyparcel_addon_sms_option").closest("tr").hide();
	jQuery("#woocommerce_easyparcel_addon_whatsapp_option").closest("tr").hide();
	jQuery("#woocommerce_easyparcel_credit_balance").hide();
	jQuery('#woocommerce_easyparcel_default_sender_address').hide();
}

function showdetails(country) {
	jQuery("#woocommerce_easyparcel_sender_detail").show();
	jQuery("#woocommerce_easyparcel_easyparcel_email").closest("tr").show();
	jQuery("#woocommerce_easyparcel_integration_id").closest("tr").show();
	jQuery("#woocommerce_easyparcel_courier_service").closest("tr").show();
	// jQuery("#woocommerce_easyparcel_enabled").closest("tr").show();

	jQuery("#woocommerce_easyparcel_order_status_update_setting").show();
	jQuery("#woocommerce_easyparcel_order_status_update_option").closest("tr").show();
	jQuery('#woocommerce_easyparcel_credit_balance').show();
	jQuery("#woocommerce_easyparcel_addon_service_setting").show();
	jQuery("#woocommerce_easyparcel_addon_email_option").closest("tr").show();
	jQuery("#woocommerce_easyparcel_addon_sms_option").closest("tr").show();
	jQuery("#woocommerce_easyparcel_addon_whatsapp_option").closest("tr").show();
	jQuery('#woocommerce_easyparcel_default_sender_address').show();
}

function clearField() {
	jQuery("#woocommerce_easyparcel_easyparcel_email").val("");
	jQuery("#woocommerce_easyparcel_integration_id").val("");
	jQuery("select#woocommerce_easyparcel_courier_service").val("cheaper");
}

function change_courier($country) {
	var courier = [];
	var option = "";
	if ($country == "SG") {
		courier["EP-CS0GU"] = "Ninjavan (Collect)";
		courier["EP-CS0MU"] = "MRight";
		courier["EP-CS04G"] = "Janio";
		courier["EP-CS0Q6"] = "J&T Express"; // archived service_id 309
		courier["EP-CS0RY"] = "UrbanFox";
		courier["EP-CS0RG"] = "Qxpress";
		courier["EP-CS0RQ"] = "Mystery Saver";
		courier["EP-CS0EK"] = "Singpost";
		courier["EP-CS0NO"] = "Aramex";
		courier["EP-CS0GH"] = "Airpak Express";
		courier["EP-CS0WO"] = "XDel";
		courier["all"] = "All Couriers";
		courier["cheaper"] = "Cheapest Courier(s)";
	} else {
		courier["EP-CR0DP"] = "J&T Express";
		courier["EP-CR05"] = "Skynet";
		courier["EP-CR0AL"] = "Teleport (Support only EM)";
		courier["EP-CR0D"] = "Airpak";
		courier["EP-CR0J"] = "Ultimate Consolidators (Support only EM)";
		courier["EP-CR0W"] = "SnT Global";
		courier["EP-CR03"] = "Aramex";
		courier["EP-CR0C"] = "DHL eCommerce";
		courier["EP-CR0Z"] = "CJ Logistics";
		courier["EP-CR0O"] = "Pgeon Delivery";
		courier["EP-CR0M"] = "Nationwide Express Courier Service Berhad";
		courier["EP-CR0A"] = "Poslaju National Courier";
		courier["all"] = "All Couriers";
		courier["cheaper"] = "Cheapest Courier(s)";
	}

	for (const key in courier) {
		if (obj.sender_state == key) {
			option += `<option value="${key}" selected='selected'>${courier[key]}</option>`;
		} else {
			option += `<option value="${key}" >${courier[key]}</option>`;
		}
	}
	jQuery("select#woocommerce_easyparcel_courier_service").empty();
	jQuery("select#woocommerce_easyparcel_courier_service").append(option);
}

function addFeedbackBanner() {
    // Check if we're on an EasyParcel-related page
    if (window.location.href.indexOf('section=easyparcel') > -1 || 
        window.location.href.indexOf('section=easyparcel_shipping') > -1) {

        // Create the banner HTML
        var bannerHTML = '<div id="easyparcel-feedback-banner" style="background-color: #fff; border-left: 4px solid #00a0d2; box-shadow: 0 1px 1px rgba(0,0,0,.04); margin: 0 0 15px; padding: 12px 15px; position: relative; font-size: 13px; line-height: 1.5;">' +
            '<div style="margin-bottom: 8px;">' +
            '<strong>Share Your Feedback!</strong> We\'re always improving the EasyParcel WooCommerce Plugin. Let us know how we can make it better: ' +
            '<a href="https://easyparcelmarketing.typeform.com/to/lDDSz4EA" target="_blank" style="color: #0073aa; text-decoration: none;">Click Here</a>' +
            '</div>' +
            '<div style="display: inline-block; margin-right: 20px;">' +
            '<strong>Need Help?</strong> Contact Us: ' +
            '<a href="https://app.easyparcel.com/my/en/contact-us" target="_blank" style="color: #0073aa; text-decoration: none;">Malaysia</a> | ' +
            '<a href="https://app.easyparcel.com/sg/en/contact-us" target="_blank" style="color: #0073aa; text-decoration: none;">Singapore</a>' +
            '</div>' +
            '<div style="display: inline-block;">' +
            '<strong>Privacy Policy:</strong> ' +
            '<a href="https://easyparcel.com/my/en/privacy/" target="_blank" style="color: #0073aa; text-decoration: none;">Malaysia</a> | ' +
            '<a href="https://www.easyparcel.sg/privacy" target="_blank" style="color: #0073aa; text-decoration: none;">Singapore</a>' +
            '</div>' +
            '</div>';

        // Specifically target the subsubsub navigation
        jQuery('.subsubsub').before(bannerHTML);
    }
}