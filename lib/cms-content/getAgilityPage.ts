import "server-only";
import { getAgilityPageProps } from "@agility/nextjs/node";
import { getAgilityContext } from "./useAgilityContext";

export interface PageProps {
	params: { slug: string[] }
	searchParams?: { [key: string]: string | string[] | undefined }
}

export interface CachedPageProps extends PageProps {
	cacheBuster: string
}

export const getAgilityPage = async ({ params }: CachedPageProps) => {

	const { isPreview: preview, locale } = getAgilityContext()

	if (!params.slug) params.slug = [""]

	const page = await getAgilityPageProps({ params, preview, locale })

	if (page.page) {
		page.page.title = new Date().toISOString()
	}

	return page

}

