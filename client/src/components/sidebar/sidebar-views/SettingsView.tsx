import Select from "@/components/common/Select"
import { useSettings } from "@/context/SettingContext"
import useResponsive from "@/hooks/useResponsive"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { ChangeEvent, useEffect } from "react"

function SettingsView() {
    const {
        theme,
        setTheme,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        resetSettings,
    } = useSettings()
    const { viewHeight } = useResponsive()

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))

    useEffect(() => {
        // Set editor font family
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller",
        ) as HTMLElement
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    return (
        <div
            className="flex flex-col items-center gap-2 p-4 "
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Settings</h1>
            {/* Choose Font Family option */}
            <div className="flex w-full items-end gap-2  ">
                <Select 
                    onChange={handleFontFamilyChange}
                    value={fontFamily}
                    options={editorFonts}
                    title="Fonts"
                />
                {/* Choose font size option */}
                <select
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="rounded-md border-white border-2 bg-slate-400 px-4 py-2 text-black outline-none"
                    title="Font Size"
                >
                    {[...Array(13).keys()].map((size) => {
                        return (
                            <option key={size} value={size + 12}>
                                {size + 12}
                            </option>
                        )
                    })}
                </select>
            </div>
            {/* Choose theme option */}
            <Select
                onChange={handleThemeChange}
                value={theme}
                options={Object.keys(editorThemes)}
                title="Theme"
            />
            
            <button
                className="mt-auto w-full rounded-md border-white border-2 bg-slate-400 px-4 py-2 text-black outline-none"
                onClick={resetSettings}
            >
                Reset to default
            </button>
        </div>
    )
}

export default SettingsView
