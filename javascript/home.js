const getLabel = (lbs) => {
    if (lbs === "bug") {
        return "text-red-600 bg-red-100 border-red-300";
    }
    else if (lbs === "enhancement") {
        return "text-green-600 bg-green-100 border-green-300";
    }
    else if (lbs === "help wanted") {
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
    }
    else if (lbs === "good first issue") {
        return "text-blue-600 bg-blue-100 border-blue-300";
    }
    else if (lbs === "documentation") {
        return "text-pink-600 bg-pink-100 border-pink-300";
    }

    return "text-gray-600 bg-gray-100 border-gray-300";
}

const loadData = async (selectedTab) => {
    isLoading(true);

    const url = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

    const result = await fetch(url);
    const data = await result.json();


    if (selectedTab === "all") {
        makeAllBtnInactive();
        document.getElementById("btn-all").classList.add("btn-primary");
        displayData(data?.data);
    } else if (selectedTab === "open") {
        const openIssueData = data?.data.filter((issue) => issue.status === "open");

        makeAllBtnInactive();
        document.getElementById("btn-open").classList.add("btn-primary");
        displayData(openIssueData);
    } else if (selectedTab === "closed") {
        const openIssueData = data?.data.filter((issue) => issue.status === "closed");

        makeAllBtnInactive();
        document.getElementById("btn-closed").classList.add("btn-primary");
        displayData(openIssueData);
    }
}

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
        cardEl.className = `bg-white py-8 shadow rounded-lg border-t-5 ${issue.status === "open" ? "border-green-700" : issue.status === "closed" ? "border-purple-700" : ""}`;

        cardEl.innerHTML = `
                    <div class="px-3 space-y-5 border-b border-gray-300 pb-5">
                        <div class="flex items-center justify-between">
                          <img  src="./assets/${issue.status === "open" ? "open-status.png" : "closed-status.png"}" alt="">
                            <p class="text-xs ${issue.priority === "high" ? "text-red-600 bg-red-100" : issue.priority === "medium" ? "text-yellow-600 bg-yellow-100" : "text-purple-600 bg-purple-100"} px-4 py-1 rounded-4xl font-semibold">${issue?.priority.toUpperCase()}</p>
                        </div>
                        <div class="space-y-1">
                            <h1 class="font-bold">${issue?.title}</h1>
                            <p class="line-clamp-2 text-gray-600 text-sm">${issue?.description}</p>
                        </div>

                        <div class="flex flex-wrap gap-1">
                            ${issue?.labels.map((lbl) => {
                            return `
                                <p class="flex items-center gap-1 border-2 text-xs px-3 py-1 rounded-2xl 
                                ${getLabel(lbl)}">
                                ${lbl.toUpperCase()}
                                </p>
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

const handleSearch = async () => {
    isLoading(true);
    const searchInputValue = document.getElementById("search-input").value.trim().toLowerCase();

    if (!searchInputValue) {
        return;
    };

    const url = `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchInputValue}`;

    console.log(url);

    const result = await fetch(url);
    const data = await result.json();

    displayData(data.data)

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

loadData("all")