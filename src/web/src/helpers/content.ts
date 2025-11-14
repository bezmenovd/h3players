
export function getContentSize(): { width: number, height: number } {
    const content = document.getElementById("content")!
    const style = window.getComputedStyle(content)

    let size = content!.getBoundingClientRect()

    size.height -= (parseInt(style.paddingTop) + parseInt(style.paddingBottom))
    size.width -= (parseInt(style.paddingLeft) + parseInt(style.paddingRight))

    return size
}
