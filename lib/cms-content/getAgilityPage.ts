import "server-only";
import { getAgilityPageProps } from "@agility/nextjs/node";
import { getAgilityContext } from "./useAgilityContext";


export interface PageProps {
	params: { slug: string[] }
	searchParams?: { [key: string]: string | string[] | undefined }
}

export const getAgilityPage = async ({ params }: PageProps) => {

	const { isPreview, locale, sitemap } = getAgilityContext()

	const preview = isPreview

	if (!params.slug) params.slug = [""]

	return await getAgilityPageProps({ params, preview, locale })

}

