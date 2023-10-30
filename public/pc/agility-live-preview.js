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

			// //add a div inside this component to show the border and edit button
			// const divInnerComp = document.createElement('div')
			// divInnerComp.classList.add('agility-component-inner')
			// component.appendChild(divInnerComp)

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
					pageID = agilityPageIDElem.getAttribute('data-agility-page')
				}
				if (agilityDynamicContentElem) {
					contentID = agilityDynamicContentElem.getAttribute('data-agility-dynamic-content')
				}

				//TODO: send this event data to the parent window
				console.log("*** Agility Preview Center ***: SPA navigation event:", currentPath)
				invokeFrameEvent('navigation', { url: currentPath, pageID, contentID })

				//init the components that may have reloaded...
				initComponents()
			}, 500)
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





