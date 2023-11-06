/**
 * Agility Preview SDK
 * This works by putting agility-data-* attributes on various elements in your markup.
 */

let isInitialized = false
let agilityGuid = null

const initCSSAndPreviewPanel = () => {

	//hide the preview bar UI if it's there
	document.body.querySelector(['[data-agility-previewbar="true"]']).style.display = 'none'

	//add the `agility-live-preview` css class to the body
	if (!document.body.classList.contains('agility-live-preview')) {

		document.body.classList.add('agility-live-preview')
		const cssLink = document.createElement("link")
		//TODO: change this link to be from a CDN...
		cssLink.href = "/pc/agility-live-preview.css"
		cssLink.rel = "stylesheet"
		cssLink.type = "text/css"
		document.head.appendChild(cssLink)
	}
}


/**
 * Initialize the components on the page
 */
const initComponents = () => {
	//find all the components on the page...
	const components = document.querySelectorAll('[data-agility-component]')
	components.forEach((component) => {
		const contentID = component.getAttribute('data-agility-component')
		if (!component.classList.contains('agility-component')) {
			component.classList.add('agility-component')

			//edit button
			const divCompEdit = document.createElement('button')
			divCompEdit.classList.add('agility-component-edit')
			divCompEdit.setAttribute('type', "button")
			divCompEdit.setAttribute("title", "Edit")
			divCompEdit.addEventListener("click", () => {
				invokeFrameEvent('edit-component', { contentID })
			})
			component.appendChild(divCompEdit)

			//edit svg
			const imgEdit = document.createElement('img')
			imgEdit.src = "https://cdn.aglty.io/content-manager/images/icons/pencil.svg"
			imgEdit.alt = "Edit"
			divCompEdit.appendChild(imgEdit)

			//now find all the fields within this component...
			component.querySelectorAll('[data-agility-field]').forEach((field) => {
				field.classList.add('agility-field')
				const fieldName = field.getAttribute('data-agility-field')

				//edit button
				const divFieldEdit = document.createElement('button')
				divFieldEdit.classList.add('agility-field-edit')
				divFieldEdit.setAttribute('type', "button")
				divFieldEdit.setAttribute("title", "Edit")
				divFieldEdit.addEventListener("click", () => {
					invokeFrameEvent('edit-field', { fieldName, contentID })
				})
				field.appendChild(divFieldEdit)

				//edit svg
				const imgEditField = document.createElement('img')
				imgEditField.src = "https://cdn.aglty.io/content-manager/images/icons/pencil.svg"
				imgEditField.alt = "Edit"
				divFieldEdit.appendChild(imgEditField)

			});

		}

	})
}

/**
 * Apply a content item to a component
 */
const applyContentItem = (contentItem) => {
	const components = document.querySelectorAll('[data-agility-component]')
	components.forEach((component) => {
		const contentID = parseInt(component.getAttribute('data-agility-component'))
		if (contentID !== contentItem.contentID) return


		//now find all the fields within this component...
		component.querySelectorAll('[data-agility-field]').forEach((field) => {

			const fieldName = field.getAttribute('data-agility-field')

			//find the field in the content item...
			const fieldNameInContentItem = Object.keys(contentItem.values).find(key => key.toLowerCase() === fieldName.toLowerCase())
			const fieldValue = contentItem.values[fieldNameInContentItem]

			//apply the field value to the field...
			if (typeof (fieldValue) === "string") {

				if (fieldValue && fieldValue.startsWith("<a ") & fieldValue.endsWith("</a>")) {
					//*** link field
					field.innerHTML = fieldValue
				} else {

					if (field.hasAttribute("data-agility-html")) {
						//*** html field
						field.innerHTML = fieldValue
					} else {
						//*** regular field...
						field.textContent = fieldValue
					}
				}
			} else if (fieldValue.url) {
				//***  image field

				const img = field.querySelector('img')

				if (img) {

					//get rid of any source elements inside this if it's a picture tag
					field.querySelectorAll('source').forEach((source) => source.remove())

					//try to match the current image src to the new one...
					const currentSrc = img.src
					const currentSrcParts = currentSrc.split("?")
					const newSrc = fieldValue.url + "?" + currentSrcParts[1]

					img.loading = "eager"
					img.alt = fieldValue.label
					img.src = newSrc
				}

			} else {
				console.warn("*** Agility Preview Center *** Cannot apply field value of field", fieldName, "value: ", fieldValue)
			}
		});

	})
}

const initializePreview = () => {
	isInitialized = true
	//ONLY proceed if we are in an iframe with a legit parent
	if (!window.parent || !window.parent.postMessage) return

	//get the guid from the body element data attribute
	agilityGuid = document.body.getAttribute('data-agility-guid')
	if (!agilityGuid) {
		console.error("*** Agility Preview Center *** - no guid found on body element. \nMake sure your body element is set up like this: <body data-agility-guid='{{agilityguid}}'>")
		return
	}
	console.log("*** Agility Preview Center *** Initializing for instance guid:", agilityGuid)

	let currentPath = location.pathname
	setInterval(() => {
		//see if the path has changed (popstate is not reliable here...)
		if (location.pathname !== currentPath) {
			currentPath = location.pathname
			setTimeout(() => {

				const agilityPageIDElem = document.querySelector('[data-agility-page]')
				const agilityDynamicContentElem = document.querySelector('[data-agility-dynamic-content]')
				let pageID = -1
				let contentID = -1
				if (agilityPageIDElem) {
					pageID = parseInt(agilityPageIDElem.getAttribute('data-agility-page'))
				}
				//don't proceed if we don't have a pageID
				if (isNaN(pageID) || pageID < 1) {
					console.warn("*** Agility Preview Center *** - no pageID found on the `data-agility-page` element. \nMake sure you can an element is set up like this: data-agility-page='{{agilitypageid}}' .")
					return
				}

				if (agilityDynamicContentElem) {
					contentID = agilityDynamicContentElem.getAttribute('data-agility-dynamic-content')
				}

				//TODO: send this event data to the parent window
				let fullUrl = location.href
				if (fullUrl.indexOf("?") > -1) {
					fullUrl = fullUrl.substring(0, fullUrl.indexOf("?"))
				}
				console.log("*** Agility Preview Center ***: SPA navigation event:", fullUrl)
				invokeFrameEvent('navigation', { url: fullUrl, pageID, contentID })

				//init the components that may have reloaded...
				initComponents()
			}, 1500)
		}
	}, 100)


	window.addEventListener('message', ({ data }) => {
		const { source, messageType, guid, arg } = data

		//filter out the messages
		if (source !== 'agility-instance' || guid !== agilityGuid) return

		switch (messageType) {
			case "ready":
				console.log("*** Agility Preview Center *** Initialized 👍")

				//init the css and preview panel
				initCSSAndPreviewPanel()

				//set the components
				initComponents()

				break
			case "content-change": {
				const contentItem = arg
				applyContentItem(contentItem)
				break
			}

			case "refresh":
				console.log("*** Agility Preview Center *** Refreshing page...", location.href)
				setTimeout(() => {

					location.replace(location.href)
				}, 1000)
				break

			default:
				console.log("*** Agility Preview Center *** Unknown message type on website:", messageType, arg)
				break;
		}

	})

	//send a message to the parent window to let it know we are ready
	invokeFrameEvent('ready')

}


const invokeFrameEvent = (messageType, arg) => {
	//send a message to the parent window to let it know we are ready
	window.parent.postMessage({
		source: 'agility-preview-center',
		guid: agilityGuid,
		messageType,
		arg
	}, '*')
}

if (document.readyState !== 'loading') {
	initializePreview()
} else {
	//wait for the page to load
	window.addEventListener('readystatechange', (ev) => {
		if (ev.target.readyState === 'complete' || ev.target.readyState === 'interactive') {
			initializePreview()
		}
	});
}





