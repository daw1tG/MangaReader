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
            // get page number
            let pageNum = img.alt.match(/(page|chapter) \d\d?\d?/i)[0]

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
                                background-color: ${cssVars.bg};
                                opacity: 1;
                                z-index: 99999999;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
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
                                background-color: ${cssVars.panel};                           
                            }

                            .button {
                                appearance:none; 
                                border:0; 
                                border-radius:14px; 
                                padding:12px 14px;
                                text-align:left;
                                background:#0f1620; 
                                color:${cssVars.text}; 
                                cursor:pointer;
                                font-weight:600;
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

function createSideBar(){
    let cssVars = {
        bg: "#0b1016", // page background 
        panel: "#121a23", // cards/panels 
        accent: "#4da3ff", // accent color 
        muted: "#9fb3c8", // secondary text 
        text: "#e8f0f8", // primary text 
        shadow: "0 10px 25px rgba(0,0,0,.35)",
        radius: "18px"
    }

    let sidebar = document.createElement("aside")
    sidebar.id = "sidebar"
    sidebar.style.width = "260px"
    sidebar.style.height = "720px"
    sidebar.style.margin = "15px"
    sidebar.style.flex = "0 0 260px"
    sidebar.style.display = "flex"
    sidebar.style.flexDirection = "column"
    sidebar.style.borderRadius = cssVars.radius
    sidebar.style.boxShadow = cssVars.shadow
    sidebar.style.gap = "8px"
    sidebar.style.padding = "14px"
    sidebar.style.position = "fixed"
    sidebar.style.top = "0"
    sidebar.style.left = "0"
    sidebar.style.zIndex = "999999999"
    sidebar.style.backgroundColor = cssVars.panel

    let header = document.createElement("h2")
    header.id = "header"
    header.textContent = "Layout Options"
    header.style.fontSize = "14px"
    header.style.letterSpacing = ".12em"
    header.style.textTransform = "uppercase"
    header.style.color = cssVars.muted
    header.style.margin = "2px 6px 8px"

    let upDownView = document.createElement("button")
    upDownView.id = "upDownView"
    upDownView.textContent = "Read Up and Down"
    upDownView.style.cssText = `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600;`
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
    leftToRightView.style.cssText = `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600; border: 2px solid #83d8fc`
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
    prevButton.style.cssText = `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600; flex: 1;
                                width: 50%; text-align: center;`
    
    let nextButton = document.createElement("button")
    nextButton.id = "nextButton"
    nextButton.textContent = "Next"
    nextButton.style.cssText = `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600; flex: 1;
                                width: 50%; text-align: center;`
    navContainer.appendChild(prevButton)
    navContainer.appendChild(nextButton)


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
    closeReader.style.cssText = `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600;`
    
    let openMenu = document.createElement("button")
    openMenu.id = "openMenu"
    openMenu.textContent = "open Menu"
    openMenu.style.cssText = `position:fixed; left:14px; bottom:14px; z-index:999999999;
                              appearance:none; border:0; border-radius:999px; padding:12px 16px; font-weight:700; cursor:pointer;
                              background:linear-gradient(160deg,#1b2a3a,#13202f); color:${cssVars.text}; box-shadow:${cssVars.shadow};
                              display:none;`

    openMenu.onclick = () => {
        let sidebar = document.querySelector("#sidebar")
        sidebar.style.display = "flex"
        let openMenuButton = document.querySelector("#openMenu")
        openMenuButton.style.display = "none"
    }

    let closeMenu = document.createElement("button")
    closeMenu.id = "closeMenu"
    closeMenu.textContent = "Hide Menu"
    closeMenu.style.cssText =  `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600;`
    closeMenu.onclick = () => {
        let sidebar = document.querySelector("#sidebar")
        sidebar.style.display = "none"
        let openMenuButton = document.querySelector("#openMenu")
        openMenuButton.style.display = "inline-flex"
    }

    closeReader.onclick = () => {
        let mangaContainer = document.querySelector("#mangaContainer")
        let manhwaContainer = document.querySelector("#manhwaContainer")

        trySendMessage("closed", (response)=>{console.log(response)})

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

function createNewSideBar(){
    let sidebar = document.createElement("aside")
    sidebar.id = "sidebar"
    sidebar.classList.add("sidebar")

    let header = document.createElement("h2")
    header.id = "header"
    header.textContent = "Layout Options"
    header.classList.add("header")

    let upDownView = document.createElement("button")
    upDownView.id = "upDownView"
    upDownView.textContent = "Read Up and Down"
    upDownView.classList.add("button")

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
    prevButton.style.width = '50%'
    prevButton.style.textAlign = 'center'
    
    let nextButton = document.createElement("button")
    nextButton.id = "nextButton"
    nextButton.textContent = "Next"
    nextButton.classList.add("button")
    nextButton.style.width = '50%'
    nextButton.style.textAlign = 'center'

    navContainer.appendChild(prevButton)
    navContainer.appendChild(nextButton)


    let closeReader = document.createElement("button")
    closeReader.id = "closeReader"
    closeReader.textContent = "Close Reader"
    closeReader.classList.add("button")
    
    let openMenu = document.createElement("button")
    openMenu.id = "openMenu"
    openMenu.textContent = "open Menu"
    openMenu.classList.add("button")
    openMenu.style.cssText = `position:fixed; left:14px; bottom:14px; z-index:999999999;
                          border-radius:999px; background:linear-gradient(160deg,#1b2a3a,#13202f);
                          box-shadow:0 10px 25px rgba(0,0,0,.35); display:none;`

    openMenu.onclick = () => {
        let sidebar = document.querySelector("#sidebar")
        sidebar.style.display = "flex"
        let openMenuButton = document.querySelector("#openMenu")
        openMenuButton.style.display = "none"
    }

    let closeMenu = document.createElement("button")
    closeMenu.id = "closeMenu"
    closeMenu.textContent = "Hide Menu"
    closeMenu.classList.add("button")

    closeMenu.onclick = () => {
        let sidebar = document.querySelector("#sidebar")
        sidebar.style.display = "none"
        let openMenuButton = document.querySelector("#openMenu")
        openMenuButton.style.display = "inline-flex"
    }

    closeReader.onclick = () => {
        let mangaContainer = document.querySelector("#mangaContainer")
        let manhwaContainer = document.querySelector("#manhwaContainer")


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
    sidebar.appendChild(closeMenu)
    sidebar.appendChild(closeReader)
    document.querySelector("#reader").appendChild(openMenu)

    return sidebar
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

let check = async ()=>{ // currently working, just adapt to manga/ manhwa containers 
    let pages = grabPages()
    await scrollToBottom()
    let newPages = grabPages()
    console.log("pages: ", pages.length)
    console.log("new pages: ", newPages.length)
    console.log("sliced new pages: ", newPages.slice(pages.length, newPages.length))
    pages = [...pages, ...newPages.slice(pages.length, newPages.length)]
    console.log("merged pages: ", pages.length)
}

async function main(){
    createStyleSheet()
    let container = createContainer()
    container.id = 'reader'
    document.body.appendChild(container)

    let sidebar = createNewSideBar()
    container.appendChild(sidebar)

    let pages = grabPages()
    let { mangaContainer, updatePages } = createMangaImgs(pages)
    let { manhwaContainer, scrollArea } = createManhwaImgs(pages)

    container.appendChild(mangaContainer)
    container.appendChild(manhwaContainer)

    console.log("pages: ", pages.length, pages)

    await scrollToBottom()
    let newPages = grabPages()
    console.log("new pages before filter: ", newPages.length, newPages)
    newPages = newPages.slice(pages.length) // newPages = newPages.slice(pages.length, newPages.length)
    console.log("new pages after filter: ", newPages.length, newPages)

    if (newPages.length === 0) return

    updatePages(newPages)
    newPages.forEach(img=>{
        let newImg = createManhwaImgTag(img)
        console.log("newImg", newImg)
        scrollArea.appendChild(newImg);
    })
    

}

function hideElements(){
    document.body.childNodes.forEach(child => {
        console.log('hiding:', child)
        if (child?.id !== 'reader'){
            child.style.display = 'none'
        }
    })
}