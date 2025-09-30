console.log("executing script")



function grabPages(){
    let pages = []

    document.querySelectorAll("img").forEach(img => {
        let alt = img.getAttribute("alt");
        if (!alt){
            return;
        }
        if (alt.match(/(P|p)age \d\d?\d?/)){
            console.log("pushing: ", img)

            // get page number
            let pageNum = img.alt.match(/(P|p)age \d\d?\d?/)[0]
            console.log(img.alt, ": ", pageNum)

            pageNum = pageNum.replace(/(P|p)age /, "")
            pageNum = parseInt(pageNum)
            // store img data
            pages.push({src: img.src, alt: img.alt, pageNum: pageNum})
        }
    })

    pages.sort((a, b) => a.pageNum - b.pageNum)

    return pages;
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
    }

    document.addEventListener("keydown", controls, true)

    return container
}

function createManhwaImgs(pages){
    let container = createContainer()
    container.id = "manhwaContainer"

    let scrollArea = document.createElement("div");
    scrollArea.style.display = "flex";
    scrollArea.style.flexDirection = "column";
    scrollArea.style.alignItems = "center";
    scrollArea.style.width = "100%";
    scrollArea.style.height = "100%";
    scrollArea.style.overflowY = "scroll";

    for (let page of pages) {
        let img = document.createElement("img");
        img.src = page.src;
        img.alt = page.alt;
        img.style.width = "400px";
        img.style.height = "auto";
        scrollArea.appendChild(img);
    }

    container.appendChild(scrollArea);

    return container
    
    // container.style.position = "relative";   // not fixed
    // container.style.height = "auto";
    // container.style.minHeight = "100vh";     // so at least fills screen
    // container.style.overflowY = "scroll";
    // container.style.alignItems = "center";
    

    // for (let page of pages){
    //     let img = document.createElement("img")
    //     img.id = `(manhwa)page ${page.pageNum}`
    //     img.src = page.src
    //     img.alt = page.alt

    //     img.style.width = "400px"
    //     img.style.height = "auto"

    //     container.appendChild(img)
    // }

    // return container
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

        mangaContainer.style.display = "none"
        manhwaContainer.style.display = "flex"
    }

    let leftToRightView = document.createElement("button")
    leftToRightView.id ="leftToRightView"
    leftToRightView.textContent = "Read Left to Right"
    leftToRightView.style.cssText = `appearance:none; border:0; border-radius:14px; 
                                padding:12px 14px; text-align:left;
                                background:#0f1620; color:${cssVars.text}; 
                                cursor:pointer; font-weight:600;`
    leftToRightView.onclick = () => {
        let mangaContainer = document.querySelector("#mangaContainer")
        let manhwaContainer = document.querySelector("#manhwaContainer")

        mangaContainer.style.display = "flex"
        manhwaContainer.style.display = "none"
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
    closeMenu.textContent = "Close Menu"
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
    //document.body.appendChild(sidebar)
}

function main(){
    console.log("grabbing pages...")
    let pages = grabPages()
    if (!pages){
        alert("could not detect pages :(")

        // check if instance is already open
        let reader = document.querySelector("#reader")
        if (reader){
            reader.remove()
        }
        return
    }
    console.log("success!", pages)

    console.log("creating manga container...")
    let mangaContainer = createMangaImgs(pages)
    console.log("success!")

    console.log("creating manhwa container...")
    let manhwaContainer = createManhwaImgs(pages)
    console.log("success!")

    let container = createContainer()
    container.id = "reader"
    document.body.appendChild(container)

    console.log("creating sidebar...")
    let sidebar = createSideBar()
    console.log("success!")

    console.log("appending to document...")
    console.log("appending sidebar...")
    container.appendChild(sidebar)
    console.log("success!")

    console.log("appending mangaContainer...")
    container.appendChild(mangaContainer)
     mangaContainer.style.display = "flex"
    console.log("success!")

    console.log("appending manhwaContainer...")
    container.appendChild(manhwaContainer)
    manhwaContainer.style.display = "none"
    console.log("success!")
}

main()

