document.addEventListener("DOMContentLoaded", () => {

	const modal = document.getElementById("QuickViewModal");
	const body = document.getElementById("quick-view-body");

	document.querySelectorAll(".products-hotspot").forEach(btn => {

		btn.addEventListener("click", async () => {

			const handle = btn.dataset.productHandle;

			const description =
				btn.dataset.productDescription || '';

			const response = await fetch(`/products/${handle}.js`);

			const product = await response.json();

			renderQuickView(product, description);

			modal.classList.add("active");

		});

	});

	document
		.querySelector(".modal-close")
		.addEventListener("click", () => {

			modal.classList.remove("active");

		});

	function formatMoney(cents) {

		return `$${(cents / 100).toFixed(2)}`;

	}

	function renderQuickView(product, description) {

		let colorHtml = '';
		let sizeHtml = '';

		product.options.forEach((option, optionIndex) => {

			const values = [
				...new Set(
					product.variants.map(
						variant => variant.options[optionIndex]
					)
				)
			];

			const optionName =
				option.name.toLowerCase();

			if (
				optionName.includes('color') ||
				optionName.includes('colour')
			) {

				colorHtml += `
        <div class="qv-option-group">

          <div class="qv-option-label">
            ${option.name}
          </div>

          <div class="qv-color-buttons">
      `;

				values.forEach((value, index) => {

					colorHtml += `
          <label class="qv-color-btn">

            <input
              type="radio"
              name="option-${optionIndex}"
              value="${value}"
              ${index === 0 ? 'checked' : ''}
            >

            <span  class="color-value" data-color="${value.toLowerCase()}">${value}</span>

          </label>
        `;

				});

				colorHtml += `
          </div>

        </div>
      `;
			} else if (
				optionName.includes('size')
			) {

				sizeHtml += `
        <div class="qv-option-group">

          <div class="qv-option-label">
            ${option.name}
          </div>

          <select
            class="qv-size-select"
            data-option-index="${optionIndex}"
          >

            <option value="">
              Choose your size
            </option>
      `;

				values.forEach(value => {

					sizeHtml += `
          <option value="${value}">
            ${value}
          </option>
        `;

				});

				sizeHtml += `
          </select>

        </div>
      `;
			}

		});

		body.innerHTML = `
    <div class="qv-layout">
      <div class="qv-left">
        <img class="qv-image" src="${product.featured_image}"  alt="${product.title}" >
      </div>
      <div class="qv-right">
        <h2 class="qv-title">
          ${product.title}
        </h2>
        <div class="qv-price">
          ${formatMoney(product.price)}
        </div>
        <div class="qv-description">
         ${description || ''}
        </div>
      </div>
    </div>
    <div class="qv-variant">
    ${colorHtml}
   <div class="qv-select-wrapper"> ${sizeHtml}</div>
  </div>
    <button class="qv-add" id="qvAddCart"> ADD TO CART <span class="btn-arrow">&rarr;</span> </button>

  `;

		document
			.getElementById("qvAddCart")
			.addEventListener("click", () => {

				addToCart(product);

			});

	}

	function getSelectedVariant(product) {

		const selectedOptions = [];

		product.options.forEach((option, index) => {

			const optionName =
				option.name.toLowerCase();

			// COLOR

			if (
				optionName.includes("color") ||
				optionName.includes("colour")
			) {

				const selectedRadio =
					document.querySelector(
						`input[name="option-${index}"]:checked`
					);

				selectedOptions.push(
					selectedRadio ?
					selectedRadio.value :
					null
				);

			}

			// SIZE
			else if (
				optionName.includes("size")
			) {

				const sizeSelect =
					document.querySelector(
						`.qv-size-select[data-option-index="${index}"]`
					);

				selectedOptions.push(
					sizeSelect.value
				);

			} else {

				const selectedRadio =
					document.querySelector(
						`input[name="option-${index}"]:checked`
					);

				selectedOptions.push(
					selectedRadio ?
					selectedRadio.value :
					null
				);

			}

		});

		return product.variants.find(variant => {

			return variant.options.every(
				(value, idx) =>
				value === selectedOptions[idx]
			);

		});

	}

	async function addToCart(product) {

		const variant =
			getSelectedVariant(product);

		if (!variant) {

			alert(
				"Please select all options"
			);

			return;

		}

		try {

			await fetch("/cart/add.js", {

				method: "POST",

				headers: {
					"Content-Type": "application/json"
				},

				body: JSON.stringify({

					id: variant.id,
					quantity: 1

				})

			});

			modal.classList.remove("active");

			window.location.href = "/cart";

		} catch (error) {

			console.error(error);

			alert(
				"Failed to add product"
			);

		}

	}

});