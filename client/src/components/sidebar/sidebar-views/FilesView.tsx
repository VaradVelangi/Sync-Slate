import FileStructureView from "@/components/files/FileStructureView"
import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import { FileSystemItem } from "@/types/file"
import cn from "classnames"
import { BiArchiveIn } from "react-icons/bi"
import { v4 as uuidV4 } from "uuid"

function FilesView() {
    const { downloadFilesAndFolders,} = useFileSystem()
    const { viewHeight } = useResponsive()
    const { minHeightReached } = useResponsive()


    const readDirectory = async (
        directoryHandle: FileSystemDirectoryHandle,
    ): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for await (const entry of directoryHandle.values()) {
            if (entry.kind === "file") {
                const file = await entry.getFile()
                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: entry.name,
                    type: "file",
                    content: await file.text(),
                }
                children.push(newFile)
            } else if (entry.kind === "directory") {
                if (blackList.includes(entry.name)) continue

                const newDirectory: FileSystemItem = {
                    id: uuidV4(),
                    name: entry.name,
                    type: "directory",
                    children: await readDirectory(entry),
                    isOpen: false,
                }
                children.push(newDirectory)
            }
        }
        return children
    }

    return (
        <div
            className="flex select-none flex-col gap-1 px-4 py-2"
            style={{ height: viewHeight, maxHeight: viewHeight }}
        >
            <FileStructureView />
            <div
                className={cn(`flex min-h-fit flex-col justify-end pt-2`, {
                    hidden: minHeightReached,
                })}
            >
                <hr />
                <button
                    className="flex w-full justify-start rounded-md p-2 transition-all hover:bg-darkHover"
                    onClick={downloadFilesAndFolders}
                >
                    <BiArchiveIn className="mr-2" size={22} /> Download File
                </button>
            </div>
        </div>
    )
}

export default FilesView
