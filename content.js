console.log("executing script")

function removeDupePages(pages) {
    const seen = new Set();
    return pages.filter(page => {
        if (seen.has(page.src)) return false;
        seen.add(page.src);
        return true;
    });
}

function grabPagesAlt(imgs){
    let pages = []
    imgs.forEach(img => {
        let alt = img.getAttribute("alt");
        if (!alt){
            return;
        }
        if (alt.match(/(page|chapter) \d\d?\d?/i)){
            console.log("pushing: ", img)

            // get page number
            let pageNum = img.alt.match(/(page|chapter) \d\d?\d?/i)[0]
            // console.log(img.alt, ": ", pageNum)

            pageNum = pageNum.replace(/(page|chapter) /i, "")
            pageNum = parseInt(pageNum)
            // store img data
            pages.push({src: img.src, alt: img.alt, pageNum: pageNum})
        }
    })

    return pages.length > 0 ? pages:false;
}

function grabPagesId(imgs){
    let pages = []

    imgs.forEach(img => {
        let id = img.getAttribute("id");
        if (!id){
            return;
        }
        if (id.match(/(image|page)(-|\/| )\d\d?\d?/i)){
            let pageNum = parseInt(id.replace(/(image|page)(-|\/| )/i, ""))

            pages.push({src: img.src, alt: img.alt, pageNum: pageNum})
        }
    })

    return pages.length > 0 ? pages:false;
}

function grabPagesClass(imgs){
    let pages = []

    imgs.forEach(img => {
        let class_ = img.getAttribute("class");
        if (!class_){
            return;
        }
        if (class_.match(/(image|page)(-|\/| )\d\d?\d?/i)){
            let pageNum = parseInt(class_.replace(/(image|page)(-|\/| )/i, ""))

            pages.push({src: img.src, alt: img.alt, pageNum: pageNum})
        }
    })

    return pages.length > 0 ? pages:false;
}

function grabPagesSrc(imgs){
    let pages = []

    imgs.forEach(img => {
        const regex = /https?:\/\/[a-zA-Z0-9.\-]+\/[a-zA-Z0-9_\/\- ]+\.(webp|jpg|jpeg|png)/i;

        if (img.src.match(regex)){
            pages.push({src: img.src, alt: img.alt, pageNum: null})
        }
    })

    return pages.length > 0 ? pages:false;
}

function grabPages(){
    let imgs = document.querySelectorAll("img")

    let result = grabPagesAlt(imgs) 
                 || grabPagesId(imgs) 
                 || grabPagesClass(imgs) 
                 || grabPagesSrc(imgs) 
                 || [];

    return removeDupePages(result);
}

function grabNextAndPrev(){
    let prev = null;
    let next = null;
    let type = null; // button or a tag

    function recurse(element, calls){
        if (calls > 5) return null;
        // console.log(element)

        if (element.tagName == "BUTTON"){
            return element
        }
        else {
            return recurse(element.parentElement, calls + 1)
        }
    }

    let possibleATag = document.querySelectorAll("a")
    possibleATag.forEach((a)=>{
        // // check if already found
        // if (next != null && prev != null) return;

        // // check for obvious attribute identifyer <-- sometimes grabs the latest chapter, depending on the site
        // let cleaned = a.outerHTML.replace(a.innerHTML, "")
        // if (cleaned.match(/next/i)){
        //     next = a.href
        //     type = 'A'
        //     return
        // }
        // else if (cleaned.match(/prev/i)){
        //     prev = a.href
        //     type = "A"
        //     return
        // }

        // dissect href
        let match = a.href.match(/chapters?(-|\/)?\d\d?\d?\d?$/)
        if (match){
            // console.log(a)
            let newChapterNum = match[0].replace(/chapters?(-|\/)?/,"")
            newChapterNum = parseInt(newChapterNum)

            let currentChapterNum = window.location.pathname.match(/chapters?(-|\/)?\d\d?\d?\d?$/)[0]
            currentChapterNum = currentChapterNum.replace(/chapters?(-|\/)?/,"")
            currentChapterNum = parseInt(currentChapterNum)
            
            console.log("current: ", currentChapterNum)
            console.log("new: ", newChapterNum)
            if (!next && currentChapterNum < newChapterNum){
                console.log("next: ", a)
                next = a.href
                type = "A"
            }
            else if (!prev && currentChapterNum > newChapterNum){
                console.log("prev: ", a)
                prev = a.href
                type = "A"
            }
        }

    })

    if (next != null && prev != null) return { prev: prev, next: next, type: type };


    // check for button navigation (less common)
    document.querySelectorAll("button > span").forEach(span => {
        if (next != null && prev != null) return;

        if (span.outerHTML.match(/(N|n)(ext|EXT)/)){
            let button = recurse(span, 0)
            if (!button)return;
            style = window.getComputedStyle(button)
            if (style.display != "none" && !button.disabled){
                next = button
                type = "BUTTON"
            }
        }
        else if (span.outerHTML.match(/(P|p)(rev|REV)/)){
            let button = recurse(span, 0)
            if (!button)return;
            style = window.getComputedStyle(button)
            if (style.display != "none" && !button.disabled){
                prev = button
                type = "BUTTON"
            }
        }
    })

    if (type == null){
        console.log("no navigation found")
    }

    return { prev: prev, next: next, type: type }
}

function createMangaImgs(pages){
    let container = createContainer()
    container.id = "mangaContainer"

    let img = document.createElement("img")
    img.id = "MangaReaderPage"
    let index = 0
    img.src = pages[index].src
    img.alt = pages[index].alt
    
    img.style.height = "100%"
    img.style.width = "auto"
    container.appendChild(img)

    // page count
    let pageCounter = document.createElement("div")
    pageCounter.style.zIndex = "999999999"
    pageCounter.style.position = "fixed"
    pageCounter.style.top = "0"
    pageCounter.style.right = "0"
    pageCounter.style.color = "white"
    container.appendChild(pageCounter)

    function updatePageCount(page, pages){
        return`${page}/${pages}`
    }
    pageCounter.textContent = updatePageCount(index+1, pages.length)

    function controls(event) {
        if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault()   
            event.stopPropagation()  
        }
    
        if (event.key == "ArrowLeft" && index != 0){
            index -= 1
            img.src = pages[index].src
            img.alt = pages[index].alt
        }
        else if (event.key == "ArrowRight" && index < pages.length - 1){
            index += 1
            img.src = pages[index].src
            img.alt = pages[index].alt
        }

        pageCounter.textContent = updatePageCount(index+1, pages.length)
    }

    function updatePages(newPages){
        pages.push(...newPages)
        pageCounter.textContent = updatePageCount(index+1, pages.length)
        console.log(pages)
        console.log(pageCounter)
    }

    document.addEventListener("keydown", controls, true)

    return { mangaContainer: container, updatePages: updatePages }
}

function createManhwaImgTag(page){
    let img = document.createElement("img");
    img.src = page.src;
    img.alt = page.alt;
    img.style.width = "400px";
    img.style.height = "auto";

    return img
}

function createManhwaImgs(pages){
    let container = createContainer()
    container.id = "manhwaContainer"

    let scrollArea = document.createElement("div");
    scrollArea.id = 'scrollArea'
    scrollArea.style.display = "flex";
    scrollArea.style.flexDirection = "column";
    scrollArea.style.alignItems = "center";
    scrollArea.style.width = "100%";
    scrollArea.style.height = "100%";
    scrollArea.style.overflowY = "scroll";

    for (let page of pages) {
        let img = createManhwaImgTag(page)
        scrollArea.appendChild(img);
    }

    container.appendChild(scrollArea);

    return { manhwaContainer: container, scrollArea }
}

function createContainer(){
    let cssVars = {
        bg: "#0b1016", // page background 
        panel: "#121a23", // cards/panels 
        accent: "#4da3ff", // accent color 
        muted: "#9fb3c8", // secondary text 
        text: "#e8f0f8", // primary text 
        shadow: "0 10px 25px rgba(0,0,0,.35)",
        radius: "18px"
    }

    const container = document.createElement('div');

    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100vh';
    container.style.backgroundColor = cssVars.bg;
    container.style.opacity = '1';
    container.style.zIndex = '99999999'; // make sure it's on top

    container.style.display = "flex"
    container.style.flexDirection = "column"
    container.style.justifyContent = "center"
    container.style.alignItems = "center";

    return container
}
function createStyleSheet(){
    let cssVars = {
        bg: "#0b1016", // page background 
        panel: "#121a23", // cards/panels 
        accent: "#4da3ff", // accent color 
        muted: "#9fb3c8", // secondary text 
        text: "#e8f0f8", // primary text 
        shadow: "0 10px 25px rgba(0,0,0,.35)",
        radius: "18px"
    }
    const styleSheet = document.createElement('style')
    styleSheet.innerHTML = `

                            .container {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100vh;
                                opacity: 1;
                                z-index: 99999999;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                            }
                            
                            .light {
                                background-color: ${cssVars.panel}
                            }
                            
                            .dark {
                                background-color: ${cssVars.bg};
                            }

                            .sidebar {
                                width: 260px;
                                height: 720px;
                                margin: 15px;
                                flex: 0 0 260px;
                                display: flex;
                                flex-direction: column;
                                border-radius: ${cssVars.radius};
                                box-shadow: ${cssVars.shadow};
                                gap: 8px;
                                padding: 14px;
                                position: fixed;
                                top: 0;
                                left: 0;
                                z-index: 999999999;
                            }

                            .button {
                                appearance:none; 
                                border:0; 
                                border-radius:14px; 
                                padding:12px 14px;
                                text-align:left;
                                color:${cssVars.text}; 
                                cursor:pointer;
                                font-weight:600;
                            }
                            
                            .navButton {
                                width: 45%;
                                margin-right: 5px;
                                margin-left: 5px;
                                text-align: center
                            }
                            
                            .hidden {
                                display:none;
                            }

                            .fixed {
                                position:fixed;
                                left:14px;
                                bottom:14px;
                                z-index:999999999;
                            }
                            
                            .rounded {
                                border-radius:999px;
                                background:linear-gradient(160deg,#1b2a3a,#13202f);
                                box-shadow: ${cssVars.shadow};                   
                            }
                            
                            
                            .header{
                                font-size: 14px;
                                letter-spacing: .12em;
                                text-transform: uppercase;
                                color: ${cssVars.muted};
                                margin: 2px 6px 8px;
                            }

                            /*loading screen*/

                            .loading::after {
                                content: '';
                                position: absolute;
                                inset: 0;
                                z-index: 999;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }

                            .loading::before {
                                content: '';
                                position: absolute;
                                width: 40px;
                                height: 40px;
                                top: 50%;
                                left: 50%;
                                translate: -50% -50%;
                                border: 4px solid #ccc;
                                border-top-color: #333;
                                border-radius: 50%;
                                animation: spin 0.8s linear infinite;
                                z-index: 1000;
                            }

                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }`
    document.head.appendChild(styleSheet)
}

function createNewSideBar(){
    let sidebar = document.createElement("aside")
    sidebar.id = "sidebar"
    sidebar.classList.add("sidebar")
    sidebar.classList.add('light')

    let header = document.createElement("h2")
    header.id = "header"
    header.textContent = "Layout Options"
    header.classList.add("header")

    let upDownView = document.createElement("button")
    upDownView.id = "upDownView"
    upDownView.textContent = "Read Up and Down"
    upDownView.classList.add("button")
    upDownView.classList.add('dark')

    upDownView.onclick = () => {
        let mangaContainer = document.querySelector("#mangaContainer")
        let manhwaContainer = document.querySelector("#manhwaContainer")

        upDownView.style.border = "2px solid #83d8fc"
        upDownView.setAttribute("inView", "true")
        document.querySelector("#leftToRightView").style.border = "none"
        document.querySelector("#leftToRightView").setAttribute("inView", "false")

        mangaContainer.style.display = "none"
        manhwaContainer.style.display = "flex"
    }

    let leftToRightView = document.createElement("button")
    leftToRightView.id ="leftToRightView"
    leftToRightView.textContent = "Read Left to Right"
    leftToRightView.classList.add("button")
    leftToRightView.classList.add('dark')

    leftToRightView.onclick = () => {
        let mangaContainer = document.querySelector("#mangaContainer")
        let manhwaContainer = document.querySelector("#manhwaContainer")

        leftToRightView.style.border = "2px solid #83d8fc"
        leftToRightView.setAttribute("inView", "true")

        document.querySelector("#upDownView").style.border = "none"
        document.querySelector("#upDownView").setAttribute("inView", "false")

        mangaContainer.style.display = "flex"
        manhwaContainer.style.display = "none"
    }

    let navContainer = document.createElement("div")
    navContainer.id = "navContainer"
    let prevButton = document.createElement("button")
    prevButton.id = "prevButton"
    prevButton.textContent = "Prev"
    prevButton.classList.add("button")
    prevButton.classList.add('dark')
    prevButton.classList.add('navButton')
    
    
    let nextButton = document.createElement("button")
    nextButton.id = "nextButton"
    nextButton.textContent = "Next"
    nextButton.classList.add("button")
    nextButton.classList.add('dark')
    nextButton.classList.add('navButton')

    navContainer.appendChild(prevButton)
    navContainer.appendChild(nextButton)

    function trySendMessage(message, sendResponse, stack=0){
        try{
            if (stack > 10) return
            chrome.runtime.sendMessage(message, sendResponse)
            return true;
        }
        catch (err){
            console.log("failure to send message to service worker, trying again...")
            setTimeout(()=>trySendMessage(message,sendResponse, stack++), 100)
        }
    }

    const aTagOnClick = (location) => {
        let result = trySendMessage('runMain', (response)=>{
            console.log(response)
        })

        if (!result){
            alert("Error navigating to next page, please close reader")
            return
        }

        let orientation = { manga:false, manhwa: true }
        if (document.querySelector("#leftToRightView").getAttribute("inView") == "true"){
            orientation.manga = true
            orientation.manhwa = false
        }
        
        trySendMessage(orientation, (response)=>{
            console.log(response)
        })
        window.location.href = location
    }

    const buttonOnClick = button => {
        let result = trySendMessage('runMain', (response)=>{
            console.log(response)
        })

        if (!result){
            alert("Error navigating to next page, please close reader")
            return
        }

        let orientation = { manga:false, manhwa: true }
        if (document.querySelector("#leftToRightView").getAttribute("inView") == "true"){
            orientation.manga = true
            orientation.manhwa = false
        }
        
        trySendMessage(orientation, (response)=>{
            console.log(response)
        })
        try{
            button.click()
        }
        catch(err){
            alert("error navigating to next page, , please close reader")
        }
        
    }

    let navOptions = null
    navOptions = grabNextAndPrev()
    console.log("nav options: ", navOptions)
    let success = navOptions != null

    if (success && navOptions.type == 'A'){
        prevButton.onclick = () => aTagOnClick(navOptions.prev)
        nextButton.onclick = () => aTagOnClick(navOptions.next)
    }
    else if (success && navOptions.type == "BUTTON"){
        prevButton.onclick = () => buttonOnClick(navOptions.prev)
        nextButton.onclick = () => buttonOnClick(navOptions.next)
    }

    let closeReader = document.createElement("button")
    closeReader.id = "closeReader"
    closeReader.textContent = "Close Reader"
    closeReader.classList.add("button")
    closeReader.classList.add('dark')
    
    let openMenu = document.createElement("button")
    openMenu.id = "openMenu"
    openMenu.textContent = "open Menu"
    openMenu.classList.add("button")
    openMenu.classList.add('light')
    openMenu.classList.add('rounded')
    openMenu.classList.add('fixed')
    openMenu.classList.add('hidden')
    // openMenu.style.cssText = `position:fixed; left:14px; bottom:14px; z-index:999999999;
    //                       border-radius:999px; background:linear-gradient(160deg,#1b2a3a,#13202f);
    //                       box-shadow:0 10px 25px rgba(0,0,0,.35); display:none;`

    openMenu.onclick = () => {
        let sidebar = document.querySelector("#sidebar")
        sidebar.style.display = "flex"
        // let openMenuButton = document.querySelector("#openMenu")
        openMenu.classList.add('hidden')
    }

    let closeMenu = document.createElement("button")
    closeMenu.id = "closeMenu"
    closeMenu.textContent = "Hide Menu"
    closeMenu.classList.add("button")
    closeMenu.classList.add('dark')

    closeMenu.onclick = () => {
        let sidebar = document.querySelector("#sidebar")
        sidebar.style.display = "none"
        // let openMenuButton = document.querySelector("#openMenu")
        openMenu.classList.remove('hidden')
    }

    closeReader.onclick = () => {
        let mangaContainer = document.querySelector("#mangaContainer")
        let manhwaContainer = document.querySelector("#manhwaContainer")

        trySendMessage("closed", (response)=>{console.log(response)})

        showElements()

        mangaContainer.remove()
        manhwaContainer.remove()
        let reader = document.querySelector("#reader")
        let sidebar = document.querySelector("#sidebar")
        reader.remove()
        sidebar.remove()

    }

    sidebar.appendChild(header)
    sidebar.appendChild(upDownView)
    sidebar.appendChild(leftToRightView)
    if (success){
        sidebar.appendChild(navContainer)
    }
    sidebar.appendChild(closeMenu)
    sidebar.appendChild(closeReader)
    document.querySelector("#reader").appendChild(openMenu)

    return sidebar
    //document.body.appendChild(sidebar)
}

function blockPopups(){
    const targetNode = document.querySelector("html")
    const observer = new MutationObserver((mutationList, observer) => {
        while (targetNode.childNodes.length > 2){
            let tag = targetNode.childNodes[targetNode.childNodes.length - 1]
            if (tag.nodeName === "HEAD" || tag.nodeName === "BODY"){break}
            console.log(`${targetNode.childNodes.length} \n ${tag.nodeName} \n ${tag.outerHTML}`)
            tag.remove()
        }
    })

    
    observer.observe(targetNode, { childList: true})
}

function scrollToBottom(){
    return new Promise((resolve, reject) => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

        const atBottom = ()=>{ return Math.abs(window.scrollY-document.body.scrollHeight) <= 1000}

        const check = setInterval(()=>{
            if (atBottom()){
                clearInterval(check)
                resolve(true)
            }
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }, 50)
        
    })
}

function hideElements(){
    document.body.childNodes.forEach(child => {
        console.log('hiding:', child)
        if (child && child.style && child?.id !== 'reader'){
            child.classList.add('hidden')
        }
    })
}

function showElements(){
    document.body.childNodes.forEach(child => {
        console.log('hiding:', child)
        if (child && child.style && child?.id !== 'reader'){
            child.classList.remove('hidden')
        }
    })
}

async function main(){
    let container = createContainer()
    container.id = "reader"
    document.body.appendChild(container)

    createStyleSheet()
    container.classList.add('loading')
    container.classList.add('dark')

    console.log("creating sidebar...")
    let sidebar = createNewSideBar() // createSideBar()
    console.log("success!")

    console.log("appending to document...")
    console.log("appending sidebar...")
    container.appendChild(sidebar)
    console.log("success!")

    console.log("grabbing pages...")
    let pages = grabPages()
    if (pages.length == 0){
        alert("could not detect pages :(")

        // check if instance is already open
        let reader = document.querySelector("#reader")
        if (reader){
            reader.remove()
        }
        return
    }
    console.log("success!", pages)

    container.classList.remove('loading')

    window.scrollTo({ top: 0, left: 0 })

    console.log("creating manga container...")
    let { mangaContainer, updatePages } = createMangaImgs(pages)
    console.log("success!")

    console.log("creating manhwa container...")
    let { manhwaContainer, scrollArea } = createManhwaImgs(pages)
    console.log("success!")

    console.log("appending mangaContainer...")
    container.appendChild(mangaContainer)
    mangaContainer.style.display = "none"
    mangaContainer.setAttribute("inView", "false")
    console.log("success!")

    console.log("appending manhwaContainer...")
    container.appendChild(manhwaContainer)
    manhwaContainer.style.display = "flex"
    manhwaContainer.setAttribute("inView", "true")
    console.log("success!")

    document.querySelector("#upDownView").click()

    chrome.runtime.sendMessage('orientation', result => {
        console.log("orientation: ", result)
        if (result == 'manga'){
            document.querySelector("#leftToRightView").click()
        }
    })

    console.log('loading all imgs')
    await scrollToBottom()

    let newPages = grabPages()
    newPages = newPages.slice(pages.length) 

    hideElements()
    blockPopups()

    if (newPages.length === 0) return

    updatePages(newPages)
    newPages.forEach(img=>{
        let newImg = createManhwaImgTag(img)
        console.log("newImg", newImg)
        scrollArea.appendChild(newImg);
    })
}

main()

