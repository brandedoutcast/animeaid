document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        new KissAnime().scrape()
    }
}

class KissAnime {
    constructor() {
        this.url = window.location.href
        this.isEpisodeURL = /episode-/i.test(this.url)
        this.seriesURL = this.url.split("/").splice(0, 5).join("/")
        this.name = this.url.split("/").filter(String)[3].replace(/-/gi, " ").trim()
        this.latestEpisodeElement = document.querySelector(".listing > tbody > tr:nth-child(3) > td:nth-child(1) > a")
        this.firstEpisodeElement = document.querySelector(".listing > tbody > tr:last-child > td:nth-child(1) > a")
        this.nextEpisodeElement = this.fetchNextEpisodeElement()
        this.episodeNumberRegex = /(?:episode[\s|-])(\d{3})/i
    }

    fetchNextEpisodeElement() {
        const nextArrowElement = document.getElementById("btnNext")
        return nextArrowElement ? nextArrowElement.parentElement : null
    }

    scrape() {
        chrome.storage.sync.get("watchlist", result => {
            const watchList = result.watchlist || []
            const animeIndex = watchList.findIndex(a => a.seriesURL === this.seriesURL)
            const animeExists = animeIndex >= 0

            const animeInfo = animeExists ? watchList[animeIndex] : {
                name: this.name,
                seriesURL: this.seriesURL
            }

            if (this.isEpisodeURL) {
                if (animeExists) {
                    this.updateWatchedEpisode(animeInfo)
                } else {
                    this.addWithWatchedEpisode(animeInfo)
                }
            } else {
                if (animeExists) {
                    this.updateLatestEpisode(animeInfo)
                } else {
                    this.addWithLatestEpisode(animeInfo)
                }
            }

            if (animeExists) {
                watchList[animeIndex] = animeInfo
            }
            else {
                watchList.push(animeInfo)
            }

            chrome.storage.sync.set({ "watchlist": watchList })
            chrome.runtime.sendMessage({ status: "done" })
        })
    }

    updateWatchedEpisode(animeInfo) {
        if (animeInfo.watchedEpisode) {
            const currentEpisode = {
                number: parseInt(this.url.match(this.episodeNumberRegex)[1]),
                url: this.url
            }

            if (currentEpisode.number >= animeInfo.watchedEpisode.number) {
                animeInfo.watchedEpisode = currentEpisode
                this.addNextEpisode(animeInfo)
            }
        } else {
            this.addWithWatchedEpisode(animeInfo)
            this.addNextEpisode(animeInfo)
        }
    }

    addNextEpisode(animeInfo) {
        if (this.nextEpisodeElement) {
            const nextEpisodeURL = this.nextEpisodeElement.getAttribute("href")

            animeInfo.nextEpisode = {
                number: parseInt(nextEpisodeURL.match(this.episodeNumberRegex)[1]),
                url: nextEpisodeURL
            }
        } else {
            animeInfo.nextEpisode = null
        }
    }

    addWithWatchedEpisode(animeInfo) {
        animeInfo.watchedEpisode = {
            number: parseInt(this.url.match(this.episodeNumberRegex)[1]),
            url: this.url
        }

        if (this.nextEpisodeElement) {
            const nextEpisodeUrl = this.nextEpisodeElement.getAttribute("href")
            animeInfo.nextEpisode = {
                number: parseInt(nextEpisodeUrl.match(this.episodeNumberRegex)[1]),
                url: nextEpisodeUrl
            }
        }
    }

    updateLatestEpisode(animeInfo) {
        animeInfo.latestEpisode = {
            number: parseInt(this.latestEpisodeElement.textContent.trim().match(this.episodeNumberRegex)[1]),
            url: this.url.replace(/\/Anime.+/gi, "") + this.latestEpisodeElement.getAttribute("href")
        }
    }

    addWithLatestEpisode(animeInfo) {
        animeInfo.latestEpisode = {
            number: parseInt(this.latestEpisodeElement.textContent.trim().match(this.episodeNumberRegex)[1]),
            url: this.url.replace(/\/Anime.+/gi, "") + this.latestEpisodeElement.getAttribute("href")
        }

        animeInfo.nextEpisode = {
            number: parseInt(this.firstEpisodeElement.textContent.trim().match(this.episodeNumberRegex)[1]),
            url: this.url.replace(/\/Anime.+/gi, "") + this.firstEpisodeElement.getAttribute("href")
        }
    }
}
