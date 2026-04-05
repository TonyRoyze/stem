import { EditorPage } from "@/components/paper-builder/editor-page"

export default async function PaperEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <EditorPage routeKey={slug} />
}
