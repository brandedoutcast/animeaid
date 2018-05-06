document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        new Popup().show()
    }
}

class Popup {
    constructor() {
        this.refreshElement = document.getElementById("refresh")
        this.clearElement = document.getElementById("clear")
        this.collectionElement = document.getElementById("collection")
        this.watchList = []
    }

    show() {
        chrome.storage.sync.get("watchlist", result => {
            this.watchList = result.watchlist || []
            for (const anime of this.watchList) {
                this.createAnimeItem(anime)
            }

            this.bindRefresh()
            this.bindClear()
            this.bindOpen()
            this.bindRemove()
        })
    }

    createAnimeItem(anime) {
        const item = document.createElement("div")
        const header = document.createElement("div")
        const title = document.createElement("h3")
        const seriesAnchor = document.createElement("a")
        const removeAnchor = document.createElement("a")
        const removeIcon = document.createElement("i")

        item.classList.add("item")
        header.classList.add("header")
        seriesAnchor.classList.add("opentab")
        seriesAnchor.setAttribute("title", `Open ${anime.name} in New Tab`)
        removeAnchor.setAttribute("title", `Delete ${anime.name} from the Watchlist`)
        removeIcon.classList.add("icon-remove")

        seriesAnchor.setAttribute("href", anime.seriesURL)
        seriesAnchor.appendChild(document.createTextNode(anime.name))
        title.appendChild(seriesAnchor)
        removeAnchor.appendChild(removeIcon)
        header.appendChild(title)
        header.appendChild(removeAnchor)
        item.appendChild(header)

        if (anime.watchedEpisode && anime.latestEpisode && anime.watchedEpisode.number === anime.latestEpisode.number) {
            const episodeInfoElement = document.createElement("div")
            episodeInfoElement.classList.add("episode-info")
            episodeInfoElement.appendChild(document.createTextNode("No New Episodes!"))

            item.appendChild(episodeInfoElement)
        } else {
            const episodesElement = document.createElement("div")
            episodesElement.classList.add("episodes")

            this.addEpisodeDetails(episodesElement, anime.watchedEpisode, "Previous")
            this.addEpisodeDetails(episodesElement, anime.nextEpisode, "Next")
            this.addEpisodeDetails(episodesElement, anime.latestEpisode, "Latest")

            item.appendChild(episodesElement)
        }

        this.collectionElement.appendChild(item)
    }

    addEpisodeDetails(parent, episode, name) {
        if (episode && episode.number) {
            const episodeAnchorElement = document.createElement("a")
            const episodeSpanElement = document.createElement("span")

            episodeAnchorElement.classList.add("opentab")
            episodeAnchorElement.setAttribute("title", `Open ${name} Episode in New Tab`)
            episodeAnchorElement.setAttribute("href", episode.url)
            episodeAnchorElement.appendChild(document.createTextNode(`${name} (${episode.number})`))

            episodeSpanElement.appendChild(episodeAnchorElement)
            parent.appendChild(episodeSpanElement)
        }
    }

    bindOpen() {
        document.querySelectorAll(".opentab").forEach(anchor =>
            anchor.addEventListener("click", () =>
                chrome.tabs.create({ url: anchor.getAttribute("href") })))
    }

    bindRemove() {
        document.querySelectorAll(".icon-remove").forEach(icon => icon.parentElement.addEventListener("click", (e) => {
            const targetURL = e.target.closest(".header").querySelector(".opentab").getAttribute("href")
            const targetIndex = this.watchList.findIndex(a => a.seriesURL === targetURL)
            this.watchList.splice(targetIndex, 1)
            e.target.closest(".item").remove()
            chrome.storage.sync.set({ "watchlist": this.watchList })
        }))
    }

    bindRefresh() {
        this.refreshElement.addEventListener("click", () => {
            for (const anime of this.watchList) {
                chrome.runtime.getBackgroundPage(bgPage => bgPage.refreshAnime(anime.seriesURL))
            }
        })
    }

    bindClear() {
        this.clearElement.addEventListener("click", () => {
            chrome.storage.sync.clear()
            document.querySelectorAll(".item").forEach(c => c.remove())
        })
    }
}
