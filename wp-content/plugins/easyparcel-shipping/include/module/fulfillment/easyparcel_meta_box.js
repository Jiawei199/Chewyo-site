jQuery(document).on("click", ".ep_fulfillment_notification_popupclose", function(){
	jQuery('#easyparcel_fulfillment_notification_popup').remove();	
});

jQuery(document).on("click", ".ep-fulfillment-notification-popup-close-icon", function(){
    // Use the clicked element as a reference point
    let titleElement = jQuery(this).closest(".popup_header").find(".popup_title");
    let titleText = titleElement.text();
    
    // For backup, also try the data attribute
    let popup = jQuery(this).closest("#easyparcel_fulfillment_notification_popup");
    let isSuccess = popup.attr("data-is-success") === "true";
    
    // Remove the popup
    popup.remove();
    
    // Check if it's a success message
    if(titleText.includes("Success") || isSuccess) {
        setTimeout(function() {
            window.location.reload();
        }, 100);
    }
});

jQuery( function( $ ) {
	var easyparcel_shipping_fulfillment = {
		init: function() {
			
			// Store original tracking number to detect edit mode
			this.originalTrackingNumber = jQuery("#tracking_number").val();
			this.originalTrackingUrl = jQuery("#tracking_url").val();

			$( '#easyparcel-shipping-integration-order-fulfillment').on( 'click', 'button.button-save-data', this.save_data );
			$( '#easyparcel-shipping-integration-order-fulfillment').on( 'click', 'button.button-save-form', this.save_form );
			$( '#easyparcel-shipping-integration-order-fulfillment').on( 'change', 'select#shipping_provider', this.shipping_provider );
			jQuery(document).ready(this.shipping_provider); //pre-load get dropoff list
		},

		save_data:function(){
			var easyparcel_parcel_category = jQuery("#easyparcel_parcel_category");
			var easyparcel_hs_code = jQuery("#easyparcel_hs_code");
			var is_international = $('#is_international').val(); 
			var api_version = $( '#api_version' ).val();

			if(api_version == 'Classic'){
				if(easyparcel_parcel_category.val() === '' ){				
					easyparcel_parcel_category.siblings('.select2-container').find('.select2-selection').css('border-color','red');
					// error = true;
				} else{
					easyparcel_parcel_category.siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
					hideerror(easyparcel_parcel_category);
				}
			}else if(api_version == 'Next Gen'){
				if(easyparcel_hs_code.length && easyparcel_hs_code.is(':visible') && easyparcel_hs_code.val() === ''){				
					easyparcel_hs_code.siblings('.select2-container').find('.select2-selection').css('border-color','red');
					// error = true;
				} else if(easyparcel_hs_code.length){
					easyparcel_hs_code.siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
					hideerror(easyparcel_hs_code);
				}
			}

			$( '#easyparcel-fulfillment-form' ).block( {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			} );

			var data = {
				action:                   'wc_shipment_tracking_save_data',
				order_id:                 woocommerce_admin_meta_boxes.post_id,
				easyparcel_parcel_category:	$( '#easyparcel_parcel_category' ).val(),
				easyparcel_hs_code:		  $('#easyparcel_hs_code').val(), 
				is_international:         is_international,
				api_version:			  api_version,
				security:                 $( '#easyparcel_fulfillment_create_nonce' ).val()
			};

			jQuery.ajax({
				url: woocommerce_admin_meta_boxes.ajax_url,
				data: data,
				type: 'POST',
				success:function(response){
					$('#easyparcel-fulfillment-form').unblock();
					if(response == "successEdit"){
						easyparcel_fulfillment_notification_popup('green_text','Save Success', "success")
					}else{
						easyparcel_fulfillment_notification_popup('red_text','Save Failed',response)
					}
				},
				error:function(err){
					console.log("Error:",err);
					$('#easyparcel-fulfillment-form').unblock();
				}
			});
		
			return false;
		},

		save_form: function () {	
			var error;	
			var tracking_number = jQuery("#tracking_number");
			var tracking_url = jQuery("#tracking_url");
			var shipping_provider = jQuery("#shipping_provider");
			var pick_up_date = jQuery("#pick_up_date");
			var easycover = jQuery("#easycover");
			var easyparcel_ddp = jQuery("#easyparcel_ddp");
			var easyparcel_parcel_category = jQuery("#easyparcel_parcel_category");
			var easyparcel_hs_code = jQuery("#easyparcel_hs_code");
			var is_international = $('#is_international').val(); 
			var api_version = $( '#api_version' ).val();

			// Detect edit mode based on original tracking number (when page loaded)
			var hasExistingTracking = this.originalTrackingNumber && 
									  this.originalTrackingNumber !== '' && 
									  this.originalTrackingNumber !== undefined &&
									  this.originalTrackingNumber !== null;

			// Validate tracking number: required in edit mode, optional in create mode
			if(hasExistingTracking && (!tracking_number.val() || tracking_number.val() === '' || tracking_number.val() === undefined)){
				showerror( tracking_number );error = true;
			} else if(hasExistingTracking) {
				hideerror(tracking_number);
			}

			if(hasExistingTracking && tracking_url.length > 0 && (!tracking_url.val() || tracking_url.val() === '' || tracking_url.val() === undefined)){
				showerror( tracking_url );error = true;
			} else if(hasExistingTracking && tracking_url.length > 0) {
				hideerror(tracking_url);
			} else {
				// Empty - just skip tracking URL validation
			}

			
			if(api_version == 'Classic'){
				if((easycover.prop('checked') || easyparcel_ddp.prop('checked')||is_international == '1') && easyparcel_parcel_category.val() === '' ){				
					easyparcel_parcel_category.siblings('.select2-container').find('.select2-selection').css('border-color','red');
					// error = true;
				} else{
					easyparcel_parcel_category.siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
					hideerror(easyparcel_parcel_category);
				}
			}else if(api_version == 'Next Gen'){
				if(easyparcel_hs_code.length && easyparcel_hs_code.is(':visible') && easyparcel_hs_code.val() === ''){				
					easyparcel_hs_code.siblings('.select2-container').find('.select2-selection').css('border-color','red');
					// error = true;
				} else if(easyparcel_hs_code.length){
					easyparcel_hs_code.siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
					hideerror(easyparcel_hs_code);
				}
				// For NextGen: parcel_category is required when DDP is enabled
				if(easyparcel_ddp.prop('checked') && easyparcel_parcel_category.val() === ''){
					easyparcel_parcel_category.siblings('.select2-container').find('.select2-selection').css('border-color','red');
					error = true;
				} else if(easyparcel_ddp.prop('checked')) {
					easyparcel_parcel_category.siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
					hideerror(easyparcel_parcel_category);
				}
			}
			
			if( shipping_provider.val() === '' ){				
				jQuery("#shipping_provider").siblings('.select2-container').find('.select2-selection').css('border-color','red');
				// error = true;
			} else{
				jQuery("#shipping_provider").siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
				hideerror(shipping_provider);
			}

			if( pick_up_date.val() === '' ){				
				showerror( pick_up_date );error = true;
			} else{
				hideerror(pick_up_date);				
			}
			
			if(error == true){
				return false;
			}
			// if ( !$( 'input#tracking_number' ).val() ) { #EDIT CASE NEED CHECK
			// 	return false;
			// }

			$( '#easyparcel-fulfillment-form' ).block( {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			} );
						
			var product_data = [];
			jQuery(".ASTProduct_row").each(function(index){
				var ASTProduct_qty = jQuery(this).find('input[type="number"]').val();
				if(ASTProduct_qty > 0){
					product_data.push({
						product: jQuery(this).find('.product_id').val(),				
						qty: jQuery(this).find('input[type="number"]').val(),				
					});					
				}
			});	

			const sender_address_data = JSON.parse($('#woocommerce_easyparcel_sender_addresses_json_single').val());
			const selected_sender_addr = sender_address_data.find((addr)=> addr.selected == 1);
			
			var jsonString = JSON.stringify(product_data);						
			var data = {
				action:                   'wc_shipment_tracking_save_form',
				order_id:                 woocommerce_admin_meta_boxes.post_id,
				shipping_provider:        $( '#shipping_provider' ).val(),
				courier_name:   		  $( '#shipping_provider' ).find('option:selected').text(),
				drop_off_point:			  $( '#drop_off' ).val(),
				pick_up_date:			  $( '#pick_up_date' ).val(),
				easycover:			  	  $( '#easycover' ).prop('checked'),
				easyparcel_ddp:			  $( '#easyparcel_ddp' ).prop('checked'),
				easyparcel_parcel_category:	$( '#easyparcel_parcel_category' ).val(),
				easyparcel_hs_code:		  $('#easyparcel_hs_code').val(), 
				is_international:         is_international,
				api_version:			  api_version,
				tracking_number:          $( 'input#tracking_number' ).val(),
				tracking_url:          	  $( 'input#tracking_url' ).val(),
				date_shipped:             $( 'input#date_shipped' ).val(),
				productlist: 	          jsonString, 
				security:                 $( '#easyparcel_fulfillment_create_nonce' ).val(),
				sender_address:			  selected_sender_addr || null
			};

			jQuery.ajax({
				url: woocommerce_admin_meta_boxes.ajax_url,		
				data: data,
				type: 'POST',				
				success: function(response) {
					$( '#easyparcel-fulfillment-form' ).unblock();
					if ( response.includes('success')	) {
						$( '#easyparcel-shipping-integration-order-fulfillment #tracking-items' ).append( response );
						$( '#easyparcel-shipping-integration-order-fulfillment button.button-show-tracking-form' ).show();
						// $( '#shipping_provider' ).selectedIndex = 0;
						// $( 'input#tracking_number' ).val( '' );
						// $( 'input#tracking_url' ).val( '' );
						// $( 'input#date_shipped' ).val( '' );
						jQuery('#order_status').val('wc-completed');
						jQuery('#order_status').select2().trigger('change');	
						jQuery('#post').before('<div id="order_updated_message" class="updated notice notice-success is-dismissible"><p>Order updated.</p><button type="button" class="notice-dismiss update-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button></div>');

						if(response == "successEdit")
							easyparcel_fulfillment_notification_popup('green_text','Edit Success', "success")
						else
							easyparcel_fulfillment_notification_popup('green_text','Fulfillment Success', response)

						return false;
					}else{
						easyparcel_fulfillment_notification_popup('red_text','Fulfillment Failed',response)
					}

				},
				error: function(response) {
					console.log('Error response:', response);			
				}
			});			
			return false;
		},

		shipping_provider: function () {

			var shipping_provider = $( '#shipping_provider' ).val();
			var easyparcel_dropoff = $( '#easyparcel_dropoff' ).val();
			var selected_easyparcel_dropoff = $( '#selected_easyparcel_dropoff' ).val();
			$('.drop_off_field').html('');
			if (!easyparcel_dropoff) {
				return;
			}
			var easyparcel_dropoff_list = JSON.parse(easyparcel_dropoff);

			for(let i = 0; i < easyparcel_dropoff_list.length; i++){
				if(easyparcel_dropoff_list[i][shipping_provider]){ // if dropoff exist
					if(easyparcel_dropoff_list[i][shipping_provider].length > 0){ // check records
						var label = '<label for="drop_off">Drop Off Point:</label><br/>';
						var dropoff_select = '<select id="drop_off" name="drop_off" class="chosen_select drop_off_dropdown" style="width:100%;">';
						dropoff_select += '<option value="">[Optional] Select Drop Off Point</option>';
						for(let j = 0; j < easyparcel_dropoff_list[i][shipping_provider].length; j++){
							var selected = ( easyparcel_dropoff_list[i][shipping_provider][j]['point_id'] == selected_easyparcel_dropoff ) ? 'selected' : '';
							dropoff_select += '<option value="'+easyparcel_dropoff_list[i][shipping_provider][j]['point_id']+'" '+selected+'>'+easyparcel_dropoff_list[i][shipping_provider][j]['point_name']+'</option>';
						}
						dropoff_select += '</select>';

						if(!$('#tracking_number').length){
							$('.drop_off_field').html(label+dropoff_select);
							jQuery('#drop_off').select2({
								matcher: modelMatcher
							});
						}
						
					}
				}
				
			}

			let has_easycover = easyparcel_easycover.includes(shipping_provider);
			let has_ddp = easyparcel_coureierDDP.includes(shipping_provider);
			let basic_coverage = (typeof easyparcel_basic_coverage_by_rate !== 'undefined') ? easyparcel_basic_coverage_by_rate[shipping_provider] : null;
			let has_basic_coverage = basic_coverage && Number(basic_coverage.basic_coverage || 0) > 0;
			let has_insure_plus = (typeof easyparcel_insure_plus_by_rate !== 'undefined') ? !!easyparcel_insure_plus_by_rate[shipping_provider] : false;
			let easycover_fee = (typeof easyparcel_easycover_price_by_rate !== 'undefined') ? Number(easyparcel_easycover_price_by_rate[shipping_provider] || 0) : 0;
			
			(has_easycover || has_ddp || has_basic_coverage || has_insure_plus) ? $('.easyparcel-add-on').show() : $('.easyparcel-add-on').hide()
			has_easycover ? $('#easycover_field').show() : $('#easycover_field').hide()
			has_ddp ? $('#easyparcel_ddp_field').show() : $('#easyparcel_ddp_field').hide()
			has_basic_coverage ? $('#basic_coverage_field').show() : $('#basic_coverage_field').hide()
			has_insure_plus ? $('#insure_plus_field').show() : $('#insure_plus_field').hide()

			// EasyCover UI (description + fee)
			if (has_easycover) {
				const cur = (basic_coverage && (basic_coverage.basic_coverage_currency || '').trim()) || '';
				$('#easycover_fee').text(`Fees: ${cur ? (cur + ' ') : ''}${easycover_fee.toFixed(2)}`);
				$('#easycover_badge').show();
			} else {
				$('#easycover_fee').text('');
				$('#easycover_badge').hide();
			}

			// Basic coverage description
			if (has_basic_coverage) {
				const cur = (basic_coverage.basic_coverage_currency || '').trim();
				const amt = basic_coverage.basic_coverage;
				const display = (cur ? (cur + ' ') : '') + amt;
				$('#basic_coverage_desc').text(`Get up to ${display} coverage for loss or damage.`);
				$('#basic_coverage').prop('checked', true).prop('disabled', true);
			} else {
				$('#basic_coverage_desc').text('');
			}

			// Insure Plus description (max coverage if provided)
			if (has_insure_plus) {
				let maxCov = (typeof easyparcel_insure_plus_max_coverage_by_rate !== 'undefined')
					? Number(easyparcel_insure_plus_max_coverage_by_rate[shipping_provider] || 0)
					: 0;
				if (maxCov > 0) {
					$('#insure_plus_desc').text(`Get up to ${maxCov} coverage for loss or damage.`);
				} else {
					$('#insure_plus_desc').text('Coverage for loss or damage.');
				}
				$('#insure_plus').prop('checked', true).prop('disabled', true);
			} else {
				$('#insure_plus_desc').text('');
			}

			// Update DDP charges display
			updateDdpChargesDisplay(shipping_provider);

			// If courier doesn't have DDP, uncheck and hide charges
			if(!has_ddp) {
				$('#easyparcel_ddp').prop('checked', false);
				$('#easyparcel_ddp_charges_display').hide();
			}

			// If courier doesn't have EasyCover, uncheck it to avoid stale "checked" state
			// keeping HS Code visible after re-quote / courier changes.
			if(!has_easycover) {
				$('#easycover').prop('checked', false);
			}

			if (typeof updateHsCodeFieldVisibility === 'function') {
				updateHsCodeFieldVisibility();
			}

		}
	}

	easyparcel_shipping_fulfillment.init();
} );
jQuery(document).on("click", ".update-dismiss", function(){	
	jQuery('#order_updated_message').fadeOut();
});
function showerror(element){
	element.css("border-color","red");
}
function hideerror(element){
	element.css("border-color","");
}

jQuery(document).ready(function() {
	jQuery('#shipping_provider').select2({
		matcher: modelMatcher
	});

	jQuery(document).on('change', '#easycover, #easyparcel_ddp', function() {
		updateHsCodeFieldVisibility();
	});
	updateHsCodeFieldVisibility();

	jQuery("#easyparcel_ddp").click((o) => {
		let shipping_provider = jQuery('#shipping_provider').val();
		let charges = (typeof easyparcel_ddp_charges !== 'undefined') ? easyparcel_ddp_charges[shipping_provider] : null;
		
		let charges_info = '';
		if(charges) {
			let total = (parseFloat(charges.import_tax_charges) + parseFloat(charges.import_duty_charges) + parseFloat(charges.handling_charges)).toFixed(2);
			charges_info = `<p style="background:#f8f9fa; padding:8px 12px; border-radius:4px; font-size:13px; margin-top:8px;">
				<strong>Estimated DDP Charges:</strong><br>
				Import Tax: ${parseFloat(charges.import_tax_charges).toFixed(2)}<br>
				Import Duty: ${parseFloat(charges.import_duty_charges).toFixed(2)}<br>
				Handling Charges: ${parseFloat(charges.handling_charges).toFixed(2)}<br>
				<strong>Total: ${total}</strong>
			</p>`;
		}

		let message_title = 'Add-On Services: Delivered Duty Paid (DDP) (Additional charges may be applied)';
		let message_content = 
		`<p>
			Enable DDP to speed and smooth out the shipment process and enhance your customer's experience. 
			<a href="https://helpcentre-my.easyparcel.com/support/solutions/articles/9000224000-what-is-delivery-duty-paid-ddp-and-delivery-duty-unpaid-ddu-" target="_blank">View More Details</a>
		</p>` + charges_info;
		if(easyparcel_account_country == 'SG'){
			message_content = 
			`<p>
				Enable DDP to speed and smooth out the shipment process and enhance your customer's experience. 
				<a href="https://helpcentre-sg.easyparcel.com/support/solutions/articles/9000224730-which-courier-is-supporting-delivery-duty-unpaid-ddu-or-delivery-duty-paid-ddp-" target="_blank">View More Details</a>
			</p>` + charges_info;
		}
		let footer = `<button class="button-secondary" onclick="ep_ddp_popup_disagree()">Disable</button>
		<button class="button-primary" onclick="ep_ddp_popup_agree()">Enable</button>`;
		
		easyparcel_fulfillment_notification_popup('orange_text',message_title, message_content, footer, false)
	})

	
	jQuery('#easyparcel_parcel_category').change((o) => {
		if(easyparcel_easycover_exclusion.includes(Number(jQuery('#easyparcel_parcel_category').val()))){
			let message_title = 'Warning!!';
			let message_content = 
			`<p>
				Oops! Your chosen item category falls under EasyCover exclusion list and is not covered by EasyCover. 
				Refer to the <a href="https://helpcentre-my.easyparcel.com/support/solutions/articles/9000196016-what-is-easycover-insurance-on-easyparcel-" target="_blank">exclusion list</a>
				for more info. No refund on EasyCover charges will be given if you would love to proceed.
			</p>`;
			if(easyparcel_account_country == 'SG'){
				message_content = 
				`<p>
				Oops! Your chosen item category falls under EasyCover exclusion list and is not covered by EasyCover. 
				Refer to the <a href="https://helpcentre-sg.easyparcel.com/support/solutions/articles/9000224715-what-is-easycover-insurance-on-easyparcel-" target="_blank">exclusion list</a>
				for more info. No refund on EasyCover charges will be given if you would love to proceed.
			</p>`;
			}
			let footer = `<button class="button-primary" onclick="ep_parcel_category_continue()">Acknowledged</button>`;
			easyparcel_fulfillment_notification_popup('orange_text',message_title, message_content, footer, false)
		}

		// Re-quote rates when parcel category changes to get updated DDP charges
		var parcel_category_val = jQuery('#easyparcel_parcel_category').val();
		if(parcel_category_val) {
			reQuoteRatesForDDP(parcel_category_val);
		}
	})

});


function ep_parcel_category_continue(){
	jQuery('#easyparcel_fulfillment_notification_popup').remove();
	jQuery('#easyparcel_parcel_category').siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
}

function ep_ddp_popup_disagree(){
	jQuery("#easyparcel_ddp").prop("checked", false);
	jQuery('#easyparcel_fulfillment_notification_popup').remove();
	jQuery('#easyparcel_ddp_charges_display').hide();
	if (typeof updateHsCodeFieldVisibility === 'function') {
		updateHsCodeFieldVisibility();
	}
}

function ep_ddp_popup_agree(){
	jQuery("#easyparcel_ddp").prop("checked", true);
	jQuery('#easyparcel_fulfillment_notification_popup').remove();
	jQuery('#easyparcel_parcel_category').siblings('.select2-container').find('.select2-selection').css('border-color','#ddd');
	// Show DDP charges when DDP is enabled
	var shipping_provider = jQuery('#shipping_provider').val();
	updateDdpChargesDisplay(shipping_provider);
	if (typeof updateHsCodeFieldVisibility === 'function') {
		updateHsCodeFieldVisibility();
	}
}

function modelMatcher (params, data) {				
	data.parentText = data.parentText || "";
	
	// Always return the object if there is nothing to compare
	if (jQuery.trim(params.term) === '') {
		return data;
	}
	
	// Do a recursive check for options with children
	if (data.children && data.children.length > 0) {
		// Clone the data object if there are children
		// This is required as we modify the object to remove any non-matches
		var match = jQuery.extend(true, {}, data);
	
		// Check each child of the option
		for (var c = data.children.length - 1; c >= 0; c--) {
		var child = data.children[c];
		child.parentText += data.parentText + " " + data.text;
	
		var matches = modelMatcher(params, child);
	
		// If there wasn't a match, remove the object in the array
		if (matches == null) {
			match.children.splice(c, 1);
		}
		}
	
		// If any children matched, return the new object
		if (match.children.length > 0) {
		return match;
		}
	
		// If there were no matching children, check just the plain object
		return modelMatcher(params, match);
	}
	
	// If the typed-in term matches the text of this term, or the text from any
	// parent term, then it's a match.
	var original = (data.parentText + ' ' + data.text).toUpperCase();
	var term = params.term.toUpperCase();
	
	
	// Check if the text contains the term
	if (original.indexOf(term) > -1) {
		return data;
	}
	
	// If it doesn't contain the term, don't return anything
	return null;
}

function easyparcel_fulfillment_notification_popup(message_title_color = '', message_title = '', message_content ='', footer = '', popup_close_icon = true){
	let html = '';
	html += `<div id="easyparcel_fulfillment_notification_popup" style="
				position: fixed;
				inset: 0;
				display: flex;
				align-items: center;      
				justify-content: center;   
				background: rgba(0, 0, 0, 0.35);
				z-index: 99999;
				overflow-y: auto;        
			" class="add_fulfillment_popup" >`;
		html += `<div class="fulfillment_popup_row">`;
			html += `<div class="popup_header">`
				html += `<h3 class="popup_title ${message_title_color}">${message_title}</h3>`;				
				popup_close_icon ? html += `<span class="dashicons dashicons-no-alt ep-fulfillment-notification-popup-close-icon"></span>` : '';
			html += `</div>`;
			html += `<div class="popup_body">${message_content}</div>`;

			if(footer !== ''){
			html += `<div class="popup_footer">${footer}</div>`;
			}
			
		html += `</div>`;
		html += `<div class="ep_fulfillment_notification_popupclose"></div>`;
	html += `</div>`;
	jQuery("body").append(html);
	
}

function showerror(element){
	element.css("border","1px solid red");
}
function hideerror(element){
	element.css("border","1px solid #ddd");
}

// Next Gen: show HS Code when international or EasyCover / DDP checkbox is checked
function updateHsCodeFieldVisibility() {
	var $field = jQuery('.hs_code_field');
	if (!$field.length || jQuery('#api_version').val() !== 'Next Gen') {
		return;
	}
	var intl = jQuery('#is_international').val() === '1';
	var ec = jQuery('#easycover').length ? jQuery('#easycover').prop('checked') : false;
	var ddp = jQuery('#easyparcel_ddp').length ? jQuery('#easyparcel_ddp').prop('checked') : false;
	$field.toggle(intl || ec || ddp);
}

// Update DDP charges display when courier changes
function updateDdpChargesDisplay(shipping_provider) {
	var charges = (typeof easyparcel_ddp_charges !== 'undefined') ? easyparcel_ddp_charges[shipping_provider] : null;
	
	if(charges && jQuery('#easyparcel_ddp').prop('checked')) {
		var importTax = parseFloat(charges.import_tax_charges || 0);
		var importDuty = parseFloat(charges.import_duty_charges || 0);
		var handling = parseFloat(charges.handling_charges || 0);
		var total = (importTax + importDuty + handling).toFixed(2);

		jQuery('#ddp_import_tax_value').text(importTax.toFixed(2));
		jQuery('#ddp_import_duty_value').text(importDuty.toFixed(2));
		jQuery('#ddp_handling_value').text(handling.toFixed(2));
		jQuery('#ddp_total_value').text(total);
		jQuery('#easyparcel_ddp_charges_display').show();
	} else {
		jQuery('#easyparcel_ddp_charges_display').hide();
	}
}

// Re-quote rates when parcel category changes to get updated DDP charges
function reQuoteRatesForDDP(parcel_category_id) {
	jQuery('#easyparcel-fulfillment-form').block({
		message: null,
		overlayCSS: { background: '#fff', opacity: 0.6 }
	});

	// Get selected sender address
	var sender_addr_val = jQuery('#woocommerce_easyparcel_sender_addresses_json_single').val();
	var sender_address = null;
	try {
		var sender_addr_arr = JSON.parse(sender_addr_val);
		sender_address = sender_addr_arr.find(function(addr) { return addr.selected == 1; }) || null;
	} catch(e) {}

	var data = {
		action: "wc_get_courier_rates",
		order_id: woocommerce_admin_meta_boxes.post_id,
		sender_address: sender_address,
		parcel_category_id: parcel_category_id,
		security: jQuery('#easyparcel_fulfillment_create_nonce').val()
	};

	jQuery.ajax({
		url: woocommerce_admin_meta_boxes.ajax_url,
		data: data,
		type: 'POST',
		success: function(response) {
			try {
				var rates = JSON.parse(response);
				var currentProvider = jQuery('#shipping_provider').val();
				var ddp_list = [];
				var ddp_charges_map = {};
				var shipment_providers_list = [];
				var easycover_list = [];
				var insurance_basic_coverage_map = {};
				var dropoff_point_list = [];

				rates.forEach(function(rate) {
					// courier listing
					shipment_providers_list.push({
						ts_slug: rate.id,
						provider_name: rate.label,
						price: rate.cost || 0,
						currency: rate.basic_coverage_currency || ""
					});

					// easycover
					if(rate.easycover) {
						easycover_list.push(rate.id);
						insurance_basic_coverage_map[rate.id] = {
							basic_coverage: rate.basic_coverage,
							basic_coverage_currency: rate.basic_coverage_currency
						};
					}

					// ddp - based on handling_charges from API response
					if(parseFloat(rate.handling_charges || 0) > 0) {
						ddp_list.push(rate.id);
						ddp_charges_map[rate.id] = {
							import_tax_charges: rate.import_tax_charges || '0.00',
							import_duty_charges: rate.import_duty_charges || '0.00',
							handling_charges: rate.handling_charges || '0.00'
						};
					}

					// dropoff point
					var dropoff = {};
					dropoff[rate.id] = rate.dropoff_point;
					dropoff_point_list.push(dropoff);
				});

				// overwrite global variables
				easyparcel_easycover = easycover_list;
				easyparcel_coureierDDP = ddp_list;
				easyparcel_ddp_charges = ddp_charges_map;
				easyparcel_insurance_basic_coverage = insurance_basic_coverage_map;

				// update dropoff list
				jQuery('#easyparcel_dropoff').val(JSON.stringify(dropoff_point_list));

				// re-render courier list preserving selection
				var courier_list_html = '<option value="">Select Preferred Courier Service</option>';
				shipment_providers_list.forEach(function(provider) {
					var sel = (provider.ts_slug === currentProvider) ? 'selected' : '';
					courier_list_html += '<option value="' + provider.ts_slug + '" ' + sel + '>' +
						provider.provider_name + ' - ' + provider.currency + ' ' + Number(provider.price).toFixed(2) +
						'</option>';
				});

				jQuery('#shipping_provider').html(courier_list_html).trigger('change');

			} catch(e) {
				console.log("Error parsing re-quote response:", e);
			}

			jQuery('#easyparcel-fulfillment-form').unblock();
		},
		error: function(err) {
			console.log("Error re-quoting rates:", err);
			jQuery('#easyparcel-fulfillment-form').unblock();
		}
	});
}
