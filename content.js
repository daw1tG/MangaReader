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

// simple regex that matches html tags --> /<(?:\/?\w*(?:\s?[^<>])*)>/g

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
        if(!next && a.textContent.match(/next/i)){
            next = a.href
            type = "A"
        }
        else if(!prev && a.textContent.match(/prev/i)){
            prev = a.href
            type = "A"
        }
        else if (/chapters?(-|\/)?\d\d?\d?\d?$/.test(a.href)){
            let match = a.href.match(/chapters?(-|\/)?\d\d?\d?\d?$/)
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

    // check button onclick events (sketchy)
    document.querySelectorAll('button').forEach(button =>{
        if (!next && /next/i.test(button.getAttribute('onclick'))){
            next = button
            type = "BUTTON"
        }
        else if (!prev && /prev/i.test(button.getAttribute('onclick'))){
            prev = button
            type = "BUTTON"
        }
    })

    if (type == null){
        console.log("no navigation found")
    }

    return { prev: prev, next: next, type: type }
}

function createMangaImg(src){
    const img = document.createElement("img")
    img.style.height = "100%"
    img.style.width = "auto"
    img.src = src

    return img
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
        showElements()
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

        //showElements()
	location.reload()

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
    return new Promise(async (resolve, reject) => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

        const atBottom = ()=>{ return Math.abs(window.scrollY-document.body.scrollHeight) <= 1000}

        const check = setInterval(async ()=>{
            if (atBottom()){
                // add delay for safety
                await new Promise(r => setTimeout(r, 1000))
                if (atBottom()){
                    clearInterval(check)
                    resolve(true)
                }
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

/**
 * Creates a self-contained progress-ring loading animation.
 *
 * A gray "track" ring is always visible; a light-blue progress ring
 * sweeps clockwise on top of it until it fully covers the track,
 * at which point `onComplete` (if provided) is called once.
 *
 * The animation only advances while the element is on screen. If the
 * element is scrolled off screen *before* it finishes, the progress
 * resets fully to 0 — it does not just pause. Once complete, scrolling
 * off screen has no effect (it stays finished) unless you call `restart()`.
 *
 * @param {Object} [options]
 * @param {number} [options.durationSeconds=1.5] - time for the ring to go from empty to full
 * @param {number} [options.size=80] - diameter of the loader in px
 * @param {string} [options.text="Next"] - text shown in the center
 * @param {Function|null} [options.onComplete=null] - called once when the ring finishes filling
 * @returns {{
*   element: HTMLDivElement,
*   setDuration: (seconds: number) => void,
*   setText: (text: string) => void,
*   restart: () => void,
*   destroy: () => void
* }}
*/
function createNextLoader({
   durationSeconds = 1.5,
   size = 80,
   text = "Next",
   onComplete = null
} = {}) {
   const cssVars = {
       bg: "#0b1016",
       panel: "#121a23",
       accent: "#4da3ff",
       muted: "#9fb3c8",
       text: "#e8f0f8",
       shadow: "0 10px 25px rgba(0,0,0,.35)",
       radius: "18px"
   }

   const strokeWidth = 6
   const radius = size / 2 - strokeWidth / 2
   const circumference = 2 * Math.PI * radius

   // outer card, styled like your .panel / .rounded elements
   const wrapper = document.createElement("div")
   wrapper.classList.add("nextLoader")
   wrapper.style.display = "flex"
   wrapper.style.alignItems = "center"
   wrapper.style.justifyContent = "center"
   wrapper.style.width = `${size + 32}px`
   wrapper.style.height = `${size + 32}px`
   wrapper.style.padding = "16px"
   wrapper.style.borderRadius = cssVars.radius
   wrapper.style.backgroundColor = cssVars.panel
   wrapper.style.boxShadow = cssVars.shadow

   // inner area holds the svg ring + centered label
   const spinArea = document.createElement("div")
   spinArea.style.position = "relative"
   spinArea.style.width = `${size}px`
   spinArea.style.height = `${size}px`
   spinArea.style.display = "flex"
   spinArea.style.alignItems = "center"
   spinArea.style.justifyContent = "center"

   const svgNS = "http://www.w3.org/2000/svg"
   const svg = document.createElementNS(svgNS, "svg")
   svg.setAttribute("width", size)
   svg.setAttribute("height", size)
   svg.style.position = "absolute"
   svg.style.top = "0"
   svg.style.left = "0"
   svg.style.transform = "rotate(-90deg)" // start the sweep at 12 o'clock

   const trackCircle = document.createElementNS(svgNS, "circle")
   trackCircle.setAttribute("cx", size / 2)
   trackCircle.setAttribute("cy", size / 2)
   trackCircle.setAttribute("r", radius)
   trackCircle.setAttribute("fill", "none")
   trackCircle.setAttribute("stroke", "rgba(159,179,200,0.25)") // muted gray track
   trackCircle.setAttribute("stroke-width", strokeWidth)

   const progressCircle = document.createElementNS(svgNS, "circle")
   progressCircle.setAttribute("cx", size / 2)
   progressCircle.setAttribute("cy", size / 2)
   progressCircle.setAttribute("r", radius)
   progressCircle.setAttribute("fill", "none")
   progressCircle.setAttribute("stroke", cssVars.accent)
   progressCircle.setAttribute("stroke-width", strokeWidth)
   progressCircle.setAttribute("stroke-linecap", "round")
   progressCircle.setAttribute("stroke-dasharray", circumference)
   progressCircle.setAttribute("stroke-dashoffset", circumference) // fully empty

   svg.appendChild(trackCircle)
   svg.appendChild(progressCircle)

   const label = document.createElement("span")
   label.textContent = text
   label.style.color = cssVars.text
   label.style.fontWeight = "600"
   label.style.fontSize = "13px"
   label.style.letterSpacing = ".08em"
   label.style.textTransform = "uppercase"
   label.style.zIndex = "1"
   label.style.position = "relative"

   spinArea.appendChild(svg)
   spinArea.appendChild(label)
   wrapper.appendChild(spinArea)

   // --- animation state ---
   let startTime = null
   let progress = 0        // 0 to 1
   let rafId = null
   let completed = false

   function draw() {
       progressCircle.setAttribute("stroke-dashoffset", circumference * (1 - progress))
   }

   function step(timestamp) {
       if (startTime === null) startTime = timestamp
       const elapsed = timestamp - startTime
       progress = Math.min(elapsed / (durationSeconds * 1000), 1)
       draw()

       if (progress < 1) {
           rafId = requestAnimationFrame(step)
       } else {
           completed = true
           rafId = null
           if (typeof onComplete === "function") onComplete()
       }
   }

   function start() {
       if (completed || rafId !== null) return
       rafId = requestAnimationFrame(step)
   }

   function resetProgress() {
       if (rafId !== null) {
           cancelAnimationFrame(rafId)
           rafId = null
       }
       startTime = null
       progress = 0
       draw()
   }

   // only advance while on screen; reset fully if scrolled off mid-load
   const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
           if (completed) return
           if (entry.isIntersecting) {
               start()
           } else {
               resetProgress()
           }
       })
   }, { threshold: 0.50 })
   observer.observe(wrapper)

   function setDuration(seconds) {
       if (rafId !== null && !completed) {
           // re-anchor startTime so current progress carries over smoothly
           startTime = performance.now() - progress * seconds * 1000
       }
       durationSeconds = seconds
   }

   function setText(newText) {
       label.textContent = newText
   }

   function restart() {
       completed = false
       resetProgress()
       start()
   }

   function destroy() {
       observer.disconnect()
       if (rafId !== null) cancelAnimationFrame(rafId)
       wrapper.remove()
   }

   return { element: wrapper, setDuration, setText, restart, destroy }
}

async function main(){
    let container = createContainer()
    container.id = "reader"
    document.body.appendChild(container)

    createStyleSheet()
    container.classList.add('loading')
    container.classList.add('dark')

    console.log("creating sidebar...")
    let sidebar = createNewSideBar() 
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

    const addLoader = args => {
        console.log('adding next page loader')
        const loader = createNextLoader(args)
        loader.element.style.width = '400px'
        document.querySelector("#scrollArea").appendChild(loader.element)
    }

    if (newPages.length === 0){
        addLoader({onComplete:()=>document.querySelector('#nextButton').click()})
        return
    }

    updatePages(newPages)
    newPages.forEach(img=>{
        let newImg = createManhwaImgTag(img)
        console.log("newImg", newImg)
        scrollArea.appendChild(newImg);
    })

    addLoader({onComplete:()=>document.querySelector('#nextButton').click()})
}

main()

