function handleFormCountryChange(selectedEle) {
	// check country to determine state options
	if (selectedEle.value == "SG") {
		state_or_zone = "Zone";
		options = `
			<option value="">Select Zone</option>
			<option value="central">CENTRAL</option>
			<option value="east">EAST</option>
			<option value="north">NORTH</option>
			<option value="northeast">NORTHEAST</option>
			<option value="west">WEST</option>
		`;
	} else {
		state_or_zone = "State";
		options = `
			<option value="">Select State</option>
			<option value="jhr">Johor</option>
			<option value="kdh">Kedah</option>
			<option value="kul">Kuala Lumpur</option>
			<option value="ktn">Kelantan</option>
			<option value="lbn">Labuan</option>
			<option value="mlk">Melaka</option>
			<option value="nsn">Negeri Sembilan</option>
			<option value="phg">Pahang</option>
			<option value="prk">Perak</option>
			<option value="pls">Perlis</option>
			<option value="png">Penang</option>
			<option value="sbh">Sabah</option>
			<option value="srw">Sarawak</option>
			<option value="sgr">Selangor</option>
			<option value="trg">Terengganu</option>
			<option value="pjy">Putra Jaya</option>
		`;
	}

	jQuery('#ep_sender_state_zone').html(options);
	jQuery('#state_zone_label').text(state_or_zone);

	jQuery('#ep_sender_phone').val('');
	jQuery('#ep_alt_sender_phone').val('');
}

function validatePhoneNum(el) {
    value = el.value.trim();

    let filter;
    let example = '';
    const country = jQuery('#ep_country').val();

    if (country === 'MY') {
        filter = /^(\+?6?01)[02-46-9]\d{7}$|^(\+?6?01)1\d{8}$/;
        example = '60164433221';

    } else if (country === 'SG') {
        filter = /^65[689]\d{7}$/;
        example = '6598765432';
    }

    if (filter && !filter.test(value)) {
        alert('Not a valid mobile format. Example: ' + example);
		el.value = '';
        return false;
    }

    return true;
}


// sender address form
function renderSenderAddressForm (index = -1) {

	let data = {};
	let options = '', state_or_zone = '';
	let country = jQuery('#woocommerce_easyparcel_sender_country').val();
	const api_version = jQuery('#api_version').text();
	let form_header = 'Add New Sender Address';


	// if edit form, get data based on index
	if(index != -1) {
		const sender_addr_data = getSenderAddressList();
		data = sender_addr_data[index];
		form_header = 'Edit Sender Address';
	}

	if(data.country) country = data.country;

	// check country to determine state options
	if (country == "SG") {
		state_or_zone = "Zone";
		options = `
			<option value="">Select Zone</option>
			<option `+ (data.state_zone == 'central' && 'selected' ) +` value="central">CENTRAL</option>
			<option `+ (data.state_zone == 'east' && 'selected' ) +` value="east">EAST</option>
			<option `+ (data.state_zone == 'north' && 'selected' ) +` value="north">NORTH</option>
			<option `+ (data.state_zone == 'northeast' && 'selected' ) +` value="northeast">NORTHEAST</option>
			<option `+ (data.state_zone == 'west' && 'selected' ) +` value="west">WEST</option>
		`;
	} else {
		state_or_zone = "State";
		options = `
			<option value="">Select State</option>
			<option `+ (data.state_zone == 'jhr' && 'selected' ) +` value="jhr">Johor</option>
			<option `+ (data.state_zone == 'kdh' && 'selected' ) +` value="kdh">Kedah</option>
			<option `+ (data.state_zone == 'ktn' && 'selected' ) +` value="ktn">Kelantan</option>
			<option `+ (data.state_zone == 'kul' && 'selected' ) +` value="kul">Kuala Lumpur</option>
			<option `+ (data.state_zone == 'lbn' && 'selected' ) +` value="lbn">Labuan</option>
			<option `+ (data.state_zone == 'mlk' && 'selected' ) +` value="mlk">Melaka</option>
			<option `+ (data.state_zone == 'nsn' && 'selected' ) +` value="nsn">Negeri Sembilan</option>
			<option `+ (data.state_zone == 'phg' && 'selected' ) +` value="phg">Pahang</option>
			<option `+ (data.state_zone == 'prk' && 'selected' ) +` value="prk">Perak</option>
			<option `+ (data.state_zone == 'pls' && 'selected' ) +` value="pls">Perlis</option>
			<option `+ (data.state_zone == 'png' && 'selected' ) +` value="png">Penang</option>
			<option `+ (data.state_zone == 'sbh' && 'selected' ) +` value="sbh">Sabah</option>
			<option `+ (data.state_zone == 'srw' && 'selected' ) +` value="srw">Sarawak</option>
			<option `+ (data.state_zone == 'sgr' && 'selected' ) +` value="sgr">Selangor</option>
			<option `+ (data.state_zone == 'trg' && 'selected' ) +` value="trg">Terengganu</option>
			<option `+ (data.state_zone == 'pjy' && 'selected' ) +` value="pjy">Putra Jaya</option>
		`;
	}

	return `
			<div class="sender-addr-form-overlay" style="
				position: fixed;
				top: 0; left: 0;
				width: 100%; height: 100%;
				background: rgba(0,0,0,0.4);
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 999999;
			">
				<div class="ep-modal" style="
					background: #fff;
					padding: 0;
					width: 495px;
					max-width: 40%;
					max-height: 80%;
					border-radius: 6px;
					box-shadow: 0 3px 12px rgba(0,0,0,.2);
					position: relative;
					display: flex;
					flex-direction: column;
				">

					<div style="
						padding: 20px;
						overflow-y: auto;
						max-height: calc(80vh - 90px);
					">

						<h2 style="margin-top:0;">${form_header}</h2>
						<p><label>Country <span style="color: red;">*</span><br>
							<select id="ep_country" style="width:100%; margin-top:4px;" onchange="handleFormCountryChange(this)" ${api_version == "Classic" ? "disabled" : ""}>
								<option ` + (country == "MY" && 'selected') + ` value="MY">Malaysia</option>
								<option ` + (country == "SG" && 'selected') + ` value="SG">Singapore</option>
							</select>
						</label></p>

						<p><label>Address Label<span style="color: red;">*</span><br>
							<input value="`+(data.label || '')+`" type="text" id="ep_addr_label" class="widefat" style="width:100%; margin-top:4px;" placeholder="address label">
						</label></p>

						<p><label>Name <span style="color: red;">*</span><br>
							<input value="`+(data.name || '')+`" type="text" id="ep_sender_name" class="widefat" style="width:100%; margin-top:4px;" placeholder="sender name">
						</label></p>

						<p>
							<label>
								Contact Number <span style="color: red;">*</span><br>
								<input
									value="${data.phone || ''}"
									type="text"
									id="ep_sender_phone"
									class="widefat"
									style="width:100%; margin-top:4px;"
									onchange="validatePhoneNum(this)"
									placeholder="contact number"
								>
							</label>
							</p>
						<p><label>Alt. Contact Number<br>
							<input 
								value="`+(data.alt_phone || '')+`" 
								type="text" 
								id="ep_alt_sender_phone" 
								class="widefat" 
								style="width:100%; margin-top:4px;"
								onchange="validatePhoneNum(this)"
								placeholder="alternate contact number"
							>
						</label></p>

						<p><label>Company Name<br>
							<input value="`+(data.company_name || '')+`" type="text" id="ep_sender_company_name" class="widefat" style="width:100%; margin-top:4px;" placeholder="company name">
						</label></p>

						<p><label>Address Line 1 <span style="color: red;">*</span><br>
							<textarea id="ep_sender_address1" class="widefat" style="width:100%; height:80px; margin-top:4px;" placeholder="address line 1">`+(data.addr1 || '')+`</textarea>
						</label></p>

						<p><label>Address Line 2<br>
							<textarea id="ep_sender_address2" class="widefat" style="width:100%; height:80px; margin-top:4px;" placeholder="address line 2">`+(data.addr2 || '')+`</textarea>
						</label></p>

						<p><label>City <span style="color: red;">*</span><br>
							<input value="`+(data.city || '')+`" type="text" id="ep_sender_city" class="widefat" style="width:100%; margin-top:4px;" placeholder="city">
						</label></p>

						<p><label><span id="state_zone_label">${state_or_zone}</span> <span style="color: red;">*</span><br>
							<select id="ep_sender_state_zone" style="width:100%; margin-top:4px;">
								${options}
							</select>
						</label></p>

						<p><label>Postcode <span style="color: red;">*</span><br>
							<input value="`+(data.postcode || '')+`" type="text" id="ep_sender_postcode" class="widefat" style="width:100%; margin-top:4px;" placeholder="postcode">
						</label></p>

						<input value="`+(data.default || '')+`" type="hidden" id="ep_is_default">

					</div>

					<!-- Sticky Footer -->
					<div style="
						padding: 15px 20px;
						background: #f9f9f9;
						border-top: 1px solid #ddd;
						position: sticky;
						bottom: 0;
						text-align: right;
						flex-shrink: 0;
					">
						<button id="save_sender_address" onclick="saveAddr('${index}')" class="button button-primary ep-modal-save" style="margin-right: 8px;">Save</button>
						<button onclick="jQuery('.sender-addr-form-overlay').remove()" class="button ep-modal-close">Cancel</button>
					</div>

				</div>
			</div>
			`;
}


function saveAddr(index) {
	// get new address data
	const 	label = jQuery('#ep_addr_label').val(),
			name = jQuery('#ep_sender_name').val(),
			phone =  jQuery('#ep_sender_phone').val(),
			alt_phone =  jQuery('#ep_alt_sender_phone').val(),
			company_name =  jQuery('#ep_sender_company_name').val(),
			addr1 =  jQuery('#ep_sender_address1').val(),
			addr2 =  jQuery('#ep_sender_address2').val(),
			city =  jQuery('#ep_sender_city').val(),
			state_zone =  jQuery('#ep_sender_state_zone').val(),
			postcode =  jQuery('#ep_sender_postcode').val(),
			country = jQuery('#ep_country').val(),
			api_version = jQuery('#api_version').text(),
			isDefault = jQuery('#ep_is_default').val();

	// capture form data
	const data = {
		label,
		name,
		phone,
		alt_phone,
		company_name,
		addr1,
		addr2,
		city,
		state_zone,
		postcode,
		country
	};
	if(isDefault)
		data.default = 1;


	// Only allow address country same as setting country for classic user
	const setting_country = jQuery("select#woocommerce_easyparcel_sender_country").find(":selected").val();
	if(api_version == "Classic" && country != setting_country) {
		alert("The country must same as setting country.");
		return;
	}
		

	// check required fields
	if (!country || !label || !name || !phone || !addr1 || !city || !state_zone || !postcode) {
		alert("Please fill in required fields!");
		return;
	}
	// get existing sender addresses
	let sender_addr_arr = getSenderAddressList() || [];

	// ensure unique label
	if(sender_addr_arr.some((addr, i) => addr.label == data.label && i != index)) {
		alert('Label name exist!')
		return;
	}

	// update sender address array and input field
	(index == -1) ? sender_addr_arr.push(data) : sender_addr_arr[index] = data;
	saveSenderAddressList(sender_addr_arr);

	// close all modals
	jQuery('.sender-addr-form-overlay').remove();
}



function renderSenderAddresses () {
	/* 1. --- Address list render ---  */
	// get sender addresses
	const sender_addr_arr = getSenderAddressList();

	// create html
	let addressListHtml = sender_addr_arr.map((addr, index) => {
		const isDefault = addr.default == 1;
		const country = addr.country == "MY" ? "Malaysia" : "Singapore";

		let phone_string = addr.phone;
		if(addr.alt_phone) phone_string += " / " + addr.alt_phone;


		const address = [
			addr.addr1,
			addr.addr2,
			addr.postcode,
			addr.state_zone,
			addr.city
		].filter(Boolean).join(", ");

		return `
		<div>
			<div>
				<span style="
					display: inline-block;
					background: #f0f6fc;
					padding: 4px 10px;
					border-radius: 5px;
					font-size: 12px;
					color: #1d4ed8;
					border: 1px solid #d0e2ff;
					font-weight: 600;
				">
					${addr.label}
				</span>
			</div>
			<div style="
				padding: 12px 14px;
				border: 1px solid #ddd;
				border-radius: 6px;
				margin-bottom: 12px;
				background: #fff;
				display: flex;
				flex-direction: column;
				line-height: 1.4;
			">

				<!-- Name + Phone + Default Badge -->
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
					<h4 style="margin: 0; font-size: 14px; font-weight: 600;">
						${addr.name}
						<span style="color:#666; font-weight: normal;">(${addr.phone})</span>
					</h4>

					<!-- Default badge -->
					${isDefault ? 
						`<span style="
							background: #007cba;
							color: #fff;
							padding: 2px 8px;
							font-size: 11px;
							border-radius: 3px;
							text-transform: uppercase;
						">
							Default
						</span>` 
					: ""}
				</div>

				<!-- Address -->
				<div style="margin-bottom: 10px; color: #333; font-size: 13px;">
					${address}<br/>
					${country}
				</div>

				<!-- Buttons row -->
				<div style="display: flex; gap: 6px; flex-wrap: wrap;">

					<!-- Default button -->
					${!(isDefault) ? 
						`<button type="button" onclick="setDefaultAddr(${index})" class="button button-secondary" style="flex-shrink: 0;">
							<span class="dashicons dashicons-star-filled" style="font-size:14px; vertical-align:middle;"></span>
							Set as Default
						</button>` 
					: ""}
					
					<!-- Edit button -->
					<button type="button" onclick="jQuery('body').append(renderSenderAddressForm(${index}))" class="button" style="flex-shrink: 0;">
						<span class="dashicons dashicons-edit" style="font-size:14px; vertical-align:middle;"></span>
						Edit
					</button>

					<!-- Delete button -->
					<button type="button" onclick="deleteAddr(${index})" class="button button-link-delete" style="flex-shrink: 0;">
						<span class="dashicons dashicons-trash" style="font-size:14px; vertical-align:middle;"></span>
						Delete
					</button>
				</div>

			</div>

		</div>
		`}).join("");

	if(!addressListHtml)
		addressListHtml = "No Saved Sender Address.";

	// render address list
	jQuery('#sender_addr_container').html(addressListHtml);
	

	/* 2. --- Default address render ---  */
	// get default address
	let default_addr = sender_addr_arr.find((addr) => addr.default == 1);

	// if there is address but no default one, set first address to be default
	if(sender_addr_arr.length > 0 && !default_addr) {
		sender_addr_arr[0].default = 1;

		saveSenderAddressList(sender_addr_arr);
		default_addr = sender_addr_arr[0];
	}

	// crate html
	let default_addr_html = '';
	if(default_addr) {
		let phone_string = default_addr.phone;
		if(default_addr.alt_phone) phone_string += " / " + default_addr.alt_phone;

		const address = [
			default_addr.addr1,
			default_addr.addr2,
			default_addr.postcode,
			default_addr.state_zone,
			default_addr.city
		].filter(Boolean).join(", ");

	const country = default_addr.country == "MY" ? "Malaysia" : "Singapore";

		default_addr_html = `
			<div style="
				width: 100%;
				background: #d5e7f3;
				border-bottom: 1px solid #ddd;
				padding: 6px 10px;
				font-size: 15px;
				font-weight: 600;
				color: #2c3338;
				text-align: left;
				box-sizing: border-box;
			">
				${default_addr.label}
			</div>

			<div style="padding: 12px 14px;">
				<div style="font-size: 14px; margin-bottom: 6px;">
					${default_addr.name}
					<span style="color:#666; font-weight: normal;">(${phone_string})</span>
				</div>

				<div style="font-size: 13px; color: #444; font-weight: normal;">
					${address}<br/>
					${country}
				</div>
			</div>
		`;	

	} else 
		default_addr_html = '<small style="font-weight: 200; color: #6e6d6dff;">No default sender address selected.</small>';
	
	// render
	jQuery('#default_sender_addr_display').html(default_addr_html);
}

function setDefaultAddr(index) {
	// update sender address data

	const sender_addr_arr = getSenderAddressList();
	const new_sender_addr_arr = sender_addr_arr.map((addr, i) => {
		i == index ? addr.default = 1 : delete addr.default;
		return addr;
	});

	saveSenderAddressList(new_sender_addr_arr);
}


function deleteAddr(index){
	if(confirm('Are you sure you want to delete this')) {

		// update sender address data
		const sender_addr_arr = getSenderAddressList();

		const new_sender_addr_arr = sender_addr_arr.filter((addr, i) => i != index);

		saveSenderAddressList(new_sender_addr_arr);
	} 
}

function getSenderAddressList() {
	const api_version = jQuery('#api_version').text();
	const country = jQuery("select#woocommerce_easyparcel_sender_country").find(":selected").val();

	if(api_version == "Classic") {
		// for classic, return sender address based on setting country
		const sender_address_data = JSON.parse(jQuery('#woocommerce_easyparcel_sender_addresses_json').val() || "[]") || null;

		if(!sender_address_data) return [];
		return sender_address_data[country];

	} else if (api_version == "NextGen") {
		// for next gen, return all sender addresses
		const sender_address_data = JSON.parse(jQuery('#woocommerce_easyparcel_sender_addresses_json').val() || '[]') || null;
		if(!sender_address_data) return [];

		const final_arr = [];
		if(Array.isArray(sender_address_data['MY']))
			final_arr.push(...sender_address_data['MY']);
		if(Array.isArray(sender_address_data['SG']))
			final_arr.push(...sender_address_data['SG']);

		return final_arr;
	}

	return [];
}

function saveSenderAddressList(addresses) {
	const sg_addr = addresses.filter(addr => addr.country == "SG");
	const my_addr = addresses.filter(addr => addr.country == "MY");

	const sender_address_data = {
		MY:my_addr,
		SG: sg_addr
	}

	jQuery('#woocommerce_easyparcel_sender_addresses_json').val(JSON.stringify(sender_address_data)).change();
}

jQuery(document).ready(function () {
	jQuery("select#woocommerce_easyparcel_sender_country").change(function (e, trigger = true) {
		renderSenderAddresses();
	});
	
	// when sender address data change, render address list and default address
	jQuery('#woocommerce_easyparcel_sender_addresses_json').change(renderSenderAddresses);

	// first render if country selected
	(jQuery("select#woocommerce_easyparcel_sender_country").val() != 'NONE') && (jQuery('#woocommerce_easyparcel_sender_addresses_json').change());

	// handle click manage address
	jQuery('#manage_sender_addr_btn').click(function() {
		// Remove existing modal (if any)
        jQuery('.sender-addresses-overlay').remove();

		// create modal
		const modal = `
			<div class="sender-addresses-overlay" style="
				position: fixed;
				top: 0; left: 0;
				width: 100%; height: 100%;
				background: rgba(0,0,0,0.4);
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 999999;
			">
				<div class="ep-modal" style="
					background: #fff;
					width: 500px;
					max-width: 90%;
					max-height: 80%;
					border-radius: 6px;
					box-shadow: 0 3px 12px rgba(0,0,0,.2);
					position: relative;
					display: flex;
					flex-direction: column;
				">

					<div style="border-bottom: 1px solid #ddd;"><h2 style="margin: 16px;">Saved Sender Addresses</h2></div>
					<div style="
						background: #fff3cd;
						color: #856404;
						padding: 12px 18px;
						border: 1px solid #ffeeba;
						border-radius: 4px;
						font-size: 14px;
						display: flex;
						align-items: center;
						gap: 10px;
						margin: 15px;
					">
    					<div>
							<span class="dashicons dashicons-warning" style="font-size: 18px;"></span>
						</div>
						<div>Courier service settings will need to be reconfigured if you change the default sender address<div>
					</div></div></div>
					<div style="display: flex; justify-content: right; padding: 0 18px;">
						<button type="button" id="load_default_address" class="button button-secondary" style="font-size:12px; padding: 2px 8px;" onclick="getDefaultSenderAddrApiVersion('load_addr')">
							Add Default Easyparcel Address
						</button>
					</div>


					<!-- Scrollable list area -->
					<div style="
						padding: 16px;
						overflow-y: auto;
						flex: 1;
						border-top: 1px solid #ddd;
						margin-top: 15px;
						
					"id='sender_addr_container'>
					</div>

					<!-- Sticky bottom buttons -->
					<div style="
						padding: 12px 16px;
						border-top: 1px solid #ddd;
						background: #fff;
						text-align: right;
						position: sticky;
						bottom: 0;
					">
						<button onclick="jQuery('body').append(renderSenderAddressForm())" class="button button-primary ep-modal-save" style="margin-right: 8px;">Add New</button>
						<button onclick="jQuery('.sender-addresses-overlay').remove();" class="button ep-modal-close">Close</button>
					</div>

				</div>
			</div>
		`;


        // Append into body
        jQuery('body').append(modal);	
		renderSenderAddresses();
	});
})