import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {



	const data = await req.json()

	console.log("data", data)

	revalidateTag(`agility-page-2`)
	//revalidatePath("/")


	return new Response(`OK`, {
		status: 200
	})


}