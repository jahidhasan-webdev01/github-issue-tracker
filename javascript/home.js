const getLabelAndIcon = (lbs) => {
    if (lbs === "bug") {
        return {
            cls: "text-red-600 bg-red-100 border-red-300",
            icon: "fa-solid fa-bug"
        };
    }
    else if (lbs === "enhancement") {
        return {
            cls: "text-green-600 bg-green-100 border-green-300",
            icon: "fa-solid fa-arrow-trend-up"
        };
    }
    else if (lbs === "help wanted") {
        return {
            cls: "text-yellow-600 bg-yellow-100 border-yellow-300",
            icon: "fa-solid fa-life-ring"
        };
    }
    else if (lbs === "good first issue") {
        return {
            cls: "text-blue-600 bg-blue-100 border-blue-300",
            icon: "fa-solid fa-circle-exclamation"
        };
    }
    else if (lbs === "documentation") {
        return {
            cls: "text-pink-600 bg-pink-100 border-pink-300",
            icon: "fa-regular fa-file-code"
        };
    }

    return {
        cls: "text-gray-600 bg-gray-100 border-gray-300",
        icon: "fa-regular fa-file-code"
    };
}

const loadData = async (selectedTab = "all") => {
    isLoading(true);
    makeAllBtnInactive();
    document.getElementById(`btn-${selectedTab}`).classList.add("btn-primary");

    const url = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

    const result = await fetch(url);
    const jsonData = await result.json();

    let issues = jsonData?.data;

    if (selectedTab !== "all") {
        issues = issues.filter((issue) => issue.status === selectedTab);;
    }

    displayData(issues);
};

const makeAllBtnInactive = () => {
    const btns = ["btn-all", "btn-open", "btn-closed"];
    btns.forEach((btn) => {
        document.getElementById(`${btn}`).classList.remove("btn-primary");
    })
}

const displayData = (data) => {
    document.getElementById("issue-count").innerText = `${data?.length}`
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    data.forEach((issue) => {
        const cardEl = document.createElement("div");
        cardEl.className = `bg-white py-8 shadow rounded-lg border-t-5 cursor-pointer ${issue.status === "open" ? "border-green-700" : issue.status === "closed" ? "border-purple-700" : ""}`;
        cardEl.onclick = () => loadModalData(issue.id);

        cardEl.innerHTML = `
                    <div class="px-3 space-y-5 border-b border-gray-300 pb-5">
                        <div class="flex items-center justify-between">
                        
                        <img src="./assets/${issue.status?.toLowerCase() === "closed" ? "closed-status.png" : "Open-Status.png"}" alt="${issue.status}">

                            <p class="text-xs ${issue.priority === "high" ? "text-red-600 bg-red-100" : issue.priority === "medium" ? "text-yellow-600 bg-yellow-100" : "text-purple-600 bg-purple-100"} px-4 py-1 rounded-4xl font-semibold">${issue?.priority.toUpperCase()}</p>
                        </div>
                        <div class="space-y-1">
                            <h1 class="font-bold">${issue?.title}</h1>
                            <p class="line-clamp-2 text-gray-600 text-sm">${issue?.description}</p>
                        </div>

                        <div class="flex flex-wrap gap-1">
                            ${issue?.labels.map((lbl) => {
            return `
                                <div class="flex items-center justify-center gap-1 border-2 text-xs px-3 py-1 rounded-2xl 
                                ${getLabelAndIcon(lbl).cls}">
                                    <i class="${getLabelAndIcon(lbl).icon}"></i>
                                    <p>${lbl.toUpperCase()}</p>
                                </div>
                             `
        }).join("")}
                        </div>      
                    </div>

                    <div class="px-3 pt-5 space-y-1 text-gray-600 text-sm">
                        <p>#${issue?.id} by ${issue?.author}</p>
                        <p>${new Date(issue?.updatedAt).toLocaleDateString("en-US")}</p>
                    </div>
        `
        cardContainer.appendChild(cardEl);
    });

    isLoading(false)
};

document.getElementById("search-input").addEventListener("keydown", (event) => {
    // only search when press on Enter
    if (event.key === "Enter") {
        handleSearch();
    }
})

const handleSearch = async () => {
    isLoading(true);
    const searchInputValue = document.getElementById("search-input").value.trim().toLowerCase();

    if (!searchInputValue) {
        isLoading(false);
        return;
    };

    makeAllBtnInactive();
    
    const url = `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchInputValue}`;

    const result = await fetch(url);
    const data = await result.json();

    const issues = data?.data;

    if (!issues || issues.length === 0) {
        const cardContainer = document.getElementById("card-container");
        cardContainer.innerHTML = `
            <div class="col-span-full flex items-center justify-center py-40">
                <p class="text-red-600 text-sm font-semibold">
                    No issues found!
                </p>
            </div>
        `;
        document.getElementById("issue-count").innerText = "0";
        isLoading(false);
        return;
    }

    displayData(issues)
}

const loadModalData = async (id) => {
    const modalContainer = document.getElementById("issue_detail_modal");

    // show modal with loading spinner first
    modalContainer.innerHTML = `
        <div class="modal-box min-h-[30vh] flex items-center justify-center py-20">
            <span class="loading loading-spinner loading-xl"></span>
        </div>
    `;

    modalContainer.showModal();

    const url = `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`;

    const result = await fetch(url);
    const data = await result.json();

    showDetailModal(data?.data)
}

const showDetailModal = (data) => {
    const modalContainer = document.getElementById("issue_detail_modal");
    modalContainer.innerHTML = `
     <div class="modal-box space-y-3">
            <h1 class="text-lg font-bold">${data.title}</h1>
            <div class="flex items-center gap-2 text-xs">
                <p class="text-xs px-4 py-1 rounded-4xl font-semibold text-white ${data.status === "open" ? "bg-green-600" : "bg-purple-600"}">${data.status}</p>
                <span class="w-2 h-2 rounded-full bg-gray-600"></span>
                <p>Opened by ${data.author}</p>
                <span class="w-2 h-2 rounded-full bg-gray-600"></span>
                <p>${new Date(data?.updatedAt).toLocaleDateString("en-US")}</p>
            </div>
            <div class="flex flex-wrap gap-1">
                ${data.labels.map((lbl) => {
        return `
                <p class="flex items-center gap-1 border-2 text-xs px-3 py-1 rounded-2xl 
                                ${getLabelAndIcon(lbl).cls}">
                                <i class="${getLabelAndIcon(lbl).icon}"></i>
                    ${lbl.toUpperCase()}
                </p>
                `
    }).join("")} 
                </p>
            </div>
            <p class="text-sm text-gray-600">${data.description}</p>

            <div class="grid grid-cols-2 py-5 px-4 bg-gray-100 rounded mt-5">
                <div>
                    <h2 class="text-sm">Assignee:</h2>
                    <h2 class="text-sm font-bold ">${data.assignee ? data.assignee : "unknown"}</h2>
                </div>
                <div>
                    <h2 class="text-sm">Priority:</h2>
                    <p class="inline-block text-xs px-4 py-0.5 rounded-4xl ${data.priority === "high" ? "text-red-900 bg-red-200" : data.priority === "medium" ? "text-yellow-900 bg-yellow-200" : "text-purple-900 bg-purple-200"}">${data.priority.toUpperCase()}</p>
                </div>
            </div>
            <div class="modal-action">
                <form method="dialog">
                    <button class="btn btn-primary">Close</button>
                </form>
            </div>
        </div>
        `

    // modalContainer.showModal();
}

const isLoading = (status) => {
    if (status) {
        document.getElementById("issues-container").classList.add("hidden")
        document.getElementById("loading-container").classList.remove("hidden")
    } else {
        document.getElementById("issues-container").classList.remove("hidden")
        document.getElementById("loading-container").classList.add("hidden")
    }
}

loadData()