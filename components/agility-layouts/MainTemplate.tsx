import React from "react"
import {ContentZone} from "@agility/nextjs"
import {getModule} from "../agility-components"

const MainTemplate = (props: any) => {
	console.log("MainTemplate props", props)
	return (
		<div>
			<div>{props.page.title}</div>
			<ContentZone name="MainContentZone" {...props} getModule={getModule} />
		</div>
	)
}

export default MainTemplate
