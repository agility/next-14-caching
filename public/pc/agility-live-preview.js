/**
 * Agility Preview SDK
 * This works by putting agility-data-* attributes on various elements in your markup.
 */

let isInitialized = false

const initializePreview = () => {
	isInitialized = true
	//ONLY proceed if we are in an iframe with a legit parent
	if (!window.parent || !window.parent.postMessage) return

	//get the guid from the body element data attribute
	const guid = document.body.getAttribute('data-agility-guid')
	if (!guid) {
		console.error("*** Agility Preview Center *** - no guid found on body element. \nMake sure your body element is set up like this: <body data-agility-guid='{{agilityguid}}'>")
		return
	}
	console.log("*** Agility Preview Center *** Initializing for instance guid:", guid)
	window.addEventListener('message', ({ data }) => {
		const { source, messageType, guid, arg } = data

		//filter out the messages
		if (source !== 'agility-instance' || guid !== guid) return

		switch (messageType) {
			case "ready":
				console.log("preview-center PARENT FRAME IS READY FOR ACTION!!!...")

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

				//find all the components on the page...
				const components = document.querySelectorAll('[data-agility-component]')
				components.forEach((component) => {
					const contentID = component.getAttribute('data-agility-component')
					if (!component.classList.contains('agility-component')) {
						component.classList.add('agility-component')

						//add a div inside this component to show the border and edit button
						const divInnerComp = document.createElement('div')
						divInnerComp.classList.add('agility-component-inner')
						component.appendChild(divInnerComp)

						//edit button
						const divCompEdit = document.createElement('div')
						divCompEdit.classList.add('agility-component-edit')
						divCompEdit.setAttribute('role', "button")
						divCompEdit.innerHTML = "Edit"
						divCompEdit.onclick = () => {
							console.log("edit component", contentID)
						}
						component.appendChild(divCompEdit)



					}

				})
				break
		}

	})

	//send a message to the parent window to let it know we are ready
	window.parent.postMessage({
		source: 'agility-preview-center',
		guid: guid,
		messageType: 'ready'
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





