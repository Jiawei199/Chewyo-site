// display spinner and disable click
function blockMetabox() {
	jQuery('#address-selection-modal').block({
		message: null, 
		overlayCSS: {
			background: '#fff',
			opacity: 0.6,
			cursor: 'not-allowed'
		}
	});
}

// remove spinner and enable click
function unblockMetabox() {
	jQuery('#address-selection-modal').unblock();
}

// render address list modal and selected address section
function renderSenderAddrList () {
	/* 1. --- Address list render ---  */
	// get sender addresses
	const sender_addr_arr = JSON.parse(jQuery('#woocommerce_easyparcel_sender_addresses_json_bulk').val() || "[]".toString()) || [];

	// create html
	let addressListHtml = sender_addr_arr.map((addr, index) => {
		const selected = addr.selected == 1;
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
					${addr.label} ${isDefault ? "<span style='color: red; font-weight: bold;'>(Default)<span>" : ""}
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
						<span style="color:#666; font-weight: normal;">(${phone_string})</span>
					</h4>

					<!-- Default badge -->
					${selected ? 
						`<span style="
							background: #007cba;
							color: #fff;
							padding: 2px 8px;
							font-size: 11px;
							border-radius: 3px;
							text-transform: uppercase;
						">
							Selected
						</span>` 
					: ""}
				</div>

				<!-- Address -->
				<div style="margin-bottom: 10px; color: #333; font-size: 13px;">
					${address}</br>
					${country}
				</div>

				<!-- Buttons row -->
				<div style="display: flex; gap: 6px; flex-wrap: wrap;">

					<!-- Select button -->
					${!(selected) ? 
						`<button type="button" onclick="selectAddr(${index})" class="button button-secondary" style="flex-shrink: 0;">
							<span class="dashicons dashicons-saved" style="font-size:16px; vertical-align:middle;"></span>
							Select
						</button>` 
					: ""}
				</div>

			</div>

		</div>
		`}).join("");
	

	if(!addressListHtml)
		addressListHtml = "No Saved Sender Address.";

	// render address list
	jQuery('#sender_addr_list').html(addressListHtml);
	

	/* 2. --- Selected address render ---  */
	// get selected address
	let selected_sender_addr = sender_addr_arr.find((addr) => addr.selected == 1);

	// if there is address but no selected one, set first address to be selected
	if(sender_addr_arr.length > 0 && !selected_sender_addr) {
		sender_addr_arr[0].selected = 1;
		jQuery('#woocommerce_easyparcel_sender_addresses_json_bulk').val(JSON.stringify(sender_addr_arr)).change();
		selected_sender_addr = sender_addr_arr[0];
	}

	// create html
	let selected_sender_addr_html = '';

	if(selected_sender_addr) {
		const address = [
			selected_sender_addr.addr1,
			selected_sender_addr.addr2,
			selected_sender_addr.postcode,
			selected_sender_addr.state_zone,
			selected_sender_addr.city
		].filter(Boolean).join(", ");

		const country = selected_sender_addr.country == "MY" ? "Malaysia" : "Singapore";

		let phone_string = selected_sender_addr.phone;
		if(selected_sender_addr.alt_phone) phone_string += " / " + selected_sender_addr.alt_phone;

		selected_sender_addr_html = `
			<input type="hidden" name="ep_selected_sender" value='${selected_sender_addr}' ?>
			<div>
				<div style="font-weight: 600; font-size: 16px;">
					${selected_sender_addr.label}
				</div>
				<div style="font-size: 12px; color: #444; line-height: 1.4;">
					<!-- Name + Phone + Default Badge -->
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
						<h4 style="margin: 0; font-size: 14px; font-weight: 600;">
							${selected_sender_addr.name}
							<span style="color:#666; font-weight: normal;">(${phone_string})</span>
						</h4>

					</div>

					<!-- Address -->
					<div style="color: #333; font-size: 13px;font-weight: normal;">
						${address}</br>
						${country}
					</div>
				</div>
			</div>
		`;
	} else 
		selected_sender_addr_html = '<small style="font-weight: 200; color: #6e6d6dff; font-size: 14px;">No sender address selected. Add Sender Address <a target="_blank" href="'+ EP_Ajax.easyparcel_setting_page +'">here</a></small>';
	
	// render
	jQuery('#selected_addr_container').html(selected_sender_addr_html);
}

jQuery(document).ready(function () {
	jQuery('#woocommerce_easyparcel_sender_addresses_json_bulk').change(renderSenderAddrList);
	jQuery('#woocommerce_easyparcel_sender_addresses_json_bulk').change(); // trigger initial render


    // handle click manage address
	jQuery('#ep_manage_sender_addr_btn').click(function() {
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
				"
				id="address-selection-modal"
				>

					<h2 style="margin: 16px;">Saved Sender Addresses</h2>
					<div style="
							display: flex;
							justify-content: space-between;
							align-items: center;
							padding: 12px 20px;
							border-top: 1px solid #ddd;
							background: #f6f7f7;
						">
						<button
							type="button"
							class="button"
							id="ep-manage-address"
							onclick="window.open('${EP_Ajax.easyparcel_setting_page}', '_blank')"
							style="
								display: inline-flex;
								align-items: center;
								gap: 6px;
							"
						>
							<span class="dashicons dashicons-location"></span>
							Manage sender addresses
						</button>

						<button
							type="button"
							class="button button-primary"
							id="ep-refresh-address"
							style="
								display: inline-flex;
								align-items: center;
								gap: 6px;
							"
							onclick="getSenderAddressFromServer()"
						>
							<span class="dashicons dashicons-update"></span>
							Refresh address
						</button>
					</div>

					<!-- Scrollable list area -->
					<div style="
						padding: 16px;
						overflow-y: auto;
						flex: 1;
						
					"id='sender_addr_list'>
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
						<button onclick="jQuery('.sender-addresses-overlay').remove();" class="button ep-modal-close">Close</button>
					</div>

				</div>
			</div>
		`;


        // Append into body
        jQuery('body').append(modal);	
		renderSenderAddrList();
	});
})