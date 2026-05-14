/**
 * E-Invoice Profile - Auto Submit Enable/Disable & Guideline Modal
 */
(function($) {
	'use strict';

	var config = typeof window.epEInvoice !== 'undefined' ? window.epEInvoice : {};

	var EP_ONE_TIME_PARAMS = ['tin_brn_changed', 'new_profile', 'ep_updated', 'ep_error'];

	function cleanUrlParams(params) {
		var url = new URL(window.location.href);
		(params || EP_ONE_TIME_PARAMS).forEach(function(p) { url.searchParams.delete(p); });
		window.history.replaceState({}, '', url.toString());
	}

	function navigateToCleanUrl() {
		var url = new URL(window.location.href);
		EP_ONE_TIME_PARAMS.forEach(function(p) { url.searchParams.delete(p); });
		window.location.href = url.toString();
	}

	function updateIdNoLabel() {
		var labels = config.id_type_labels || {};
		var idType = $('#id_type').val() || 'BRN';
		var label = labels[idType] || labels.BRN || 'ID No';
		$('#id_no_label').html(label + ' <span class="required">*</span>');
	}

	function init() {
		// ID Type: dynamic label for ID No
		$(document).on('change', '#id_type', updateIdNoLabel);
		updateIdNoLabel();

		// Handle new_profile prompt (first time save)
		if (config.new_profile === 1 || config.new_profile === '1') {
			cleanUrlParams(EP_ONE_TIME_PARAMS);
			if (confirm(config.i18n_enable_prompt || 'E-Invoice Profile saved successfully. Would you like to enable Auto Submit E-Invoice to LHDN?')) {
				openGuidelineModal();
			}
		}

		// Handle tin_brn_changed - show error and open guideline
		else if (config.tin_brn_changed === 1 || config.tin_brn_changed === '1') {
			cleanUrlParams(EP_ONE_TIME_PARAMS);
			openGuidelineModal();
		}

		// Clean one-time params (ep_updated, ep_error) so refresh does not re-show notices
		else if (window.location.search && /[?&](ep_updated|ep_error)=/.test(window.location.search)) {
			cleanUrlParams(EP_ONE_TIME_PARAMS);
		}

		// Enable button
		$(document).on('click', '#ep-enable-auto-submit-btn', function() {
			openGuidelineModal();
		});

		// Disable button
		$(document).on('click', '#ep-disable-auto-submit-btn', function() {
			if (!config.ajax_url || !config.nonce) {
				alert(config.i18n_missing_config || 'Missing AJAX configuration. Please refresh and try again.');
				return;
			}
			if (!confirm(config.i18n_disable_confirm || 'Are you sure you want to disable Auto Submit E-Invoice?')) {
				return;
			}
		var $btn = $(this).prop('disabled', true);
		$.post(config.ajax_url, {
			action: 'ep_disable_einvoice_auto_submit',
			nonce: config.nonce
		}).done(function(response) {
			if (response.success) {
				navigateToCleanUrl();
			} else {
				$btn.prop('disabled', false);
				alert(response.data && response.data.message ? response.data.message : 'Failed to disable.');
			}
		}).fail(function() {
			$btn.prop('disabled', false);
			alert('Request failed. Please try again.');
		});
		});

		// Done Setting, Continue to Verification
		$(document).on('click', '#ep-done-setting-verify-btn', function() {
			if (!config.ajax_url || !config.nonce) {
				alert(config.i18n_missing_config || 'Missing AJAX configuration. Please refresh and try again.');
				return;
			}
			var $btn = $(this);
			var $result = $('#ep-verification-result');
			$result.hide().empty();
			$btn.prop('disabled', true).text(config.i18n_verifying || 'Verifying...');

		$.post(config.ajax_url, {
			action: 'ep_verify_and_enable_einvoice',
			nonce: config.nonce
		}).done(function(response) {
			if (response.success) {
				showResult($result, response.data && response.data.message ? response.data.message : 'Verified successfully.', true);
				setTimeout(navigateToCleanUrl, 2000);
			} else {
				var msg = (response.data && response.data.message) ? response.data.message : 'E-invoice candidate authentication failed, please follow the documentation to add Intermediary on MyInvoice Portal.';
				showResult($result, msg, false);
				$btn.prop('disabled', false).text(config.i18n_done_verify || 'Done Setting, Continue to Verification');
			}
		}).fail(function(jqXHR, textStatus) {
			showResult($result, 'Request failed (' + textStatus + '). Please try again.', false);
			$btn.prop('disabled', false).text(config.i18n_done_verify || 'Done Setting, Continue to Verification');
		});
		});

		// Close guideline modal
		$(document).on('click', '#ep-close-guideline-btn', function() {
			closeGuidelineModal();
		});

		$(document).on('click', '#ep-guideline-modal', function(e) {
			if (e.target === this) {
				closeGuidelineModal();
			}
		});

		// Copy badges
		$(document).on('click', '.ep-copy-btn', function(e) {
			e.preventDefault();
			var $badge = $(this).closest('.ep-copy-badge');
			var text = $badge.attr('data-copy') || $badge.clone().children().remove().end().text().trim();
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(text).then(function() {
					var $btn = $badge.find('.ep-copy-btn');
					var orig = $btn.text();
					$btn.text('✓');
					setTimeout(function() { $btn.text(orig); }, 1000);
				});
			} else {
				var $tmp = $('<textarea>').val(text).css({ position: 'fixed', left: '-9999px' }).appendTo('body').select();
				document.execCommand('copy');
				$tmp.remove();
				var $btn = $badge.find('.ep-copy-btn');
				var orig = $btn.text();
				$btn.text('✓');
				setTimeout(function() { $btn.text(orig); }, 1000);
			}
		});
	}

	function showResult($el, message, isSuccess) {
		$el.empty().append(
			$('<p>').css({ color: isSuccess ? '#46b450' : '#dc3232', margin: 0 }).text(message)
		).show();
	}

	function openGuidelineModal() {
		var $modal = $('#ep-guideline-modal');
		if ($modal.length) {
			$modal.css({'display': 'flex'});
			$('#ep-verification-result').hide().empty();
			$('#ep-done-setting-verify-btn').prop('disabled', false).text(config.i18n_done_verify || 'Done Setting, Continue to Verification');
		}
	}

	function closeGuidelineModal() {
		$('#ep-guideline-modal').css('display', 'none');
	}

	$(function() {
		init();
	});

})(jQuery);
