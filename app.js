const client = new WebTorrent({
tracker:{
announce:[
"wss://tracker.openwebtorrent.com",
"wss://tracker.btorrent.xyz",
"wss://tracker.webtorrent.dev"
]
}
})

const list = document.getElementById("torrentList")
const magnetInput = document.getElementById("magnetInput")

const downSpeed = document.getElementById("downSpeed")
const upSpeed = document.getElementById("upSpeed")
const torrentCount = document.getElementById("torrentCount")

let saved = JSON.parse(localStorage.getItem("torrents") || "[]")

saved.forEach(addTorrent)

/* Add magnet */

document.getElementById("addBtn").onclick = ()=>{

const magnet = magnetInput.value.trim()

if(!magnet) return

saveMagnet(magnet)
addTorrent(magnet)

magnetInput.value=""
}

/* Upload */

document.getElementById("torrentFile").addEventListener("change",e=>{
addTorrent(e.target.files[0])
})

/* Drag drop */

const drop = document.getElementById("dropZone")

drop.ondragover = e=>{
e.preventDefault()
drop.classList.add("drag")
}

drop.ondragleave = ()=>{
drop.classList.remove("drag")
}

drop.ondrop = e=>{
e.preventDefault()
drop.classList.remove("drag")

const file = e.dataTransfer.files[0]

if(file){
addTorrent(file)
}else{
const magnet = e.dataTransfer.getData("text")
addTorrent(magnet)
}
}

/* Save magnets */

function saveMagnet(m){
saved.push(m)
localStorage.setItem("torrents",JSON.stringify(saved))
}

/* Torrent */

function addTorrent(source){

const el = document.createElement("div")
el.className="torrent"

el.innerHTML=`

<div class="torrentTop">
<div class="title">Loading...</div>
<div class="peers"></div>
</div>

<div class="progress">
<div class="bar"></div>
</div>

<div class="stats"></div>

<div class="controlsRow">
<button class="small pause">Pause</button>
<button class="small resume">Resume</button>
<button class="small remove">Remove</button>
</div>
`

list.appendChild(el)

const title = el.querySelector(".title")
const peers = el.querySelector(".peers")
const bar = el.querySelector(".bar")
const stats = el.querySelector(".stats")

client.add(source,torrent=>{

title.innerText = torrent.name
torrentCount.innerText = client.torrents.length

setInterval(()=>{

bar.style.width = (torrent.progress*100)+"%"

stats.innerText =
(torrent.progress*100).toFixed(1)+"% | " +
format(torrent.downloadSpeed)+"/s"

peers.innerText = torrent.numPeers+" peers"

},500)

/* Pause */

el.querySelector(".pause").onclick=()=>torrent.pause()

/* Resume */

el.querySelector(".resume").onclick=()=>torrent.resume()

/* Remove */

el.querySelector(".remove").onclick=()=>{
torrent.destroy()
el.remove()
}

})

}

/* Global stats */

setInterval(()=>{

let down=0
let up=0

client.torrents.forEach(t=>{
down+=t.downloadSpeed
up+=t.uploadSpeed
})

downSpeed.innerText=format(down)+"/s"
upSpeed.innerText=format(up)+"/s"

},1000)

function format(bytes){

if(bytes<1024) return bytes+" B"
if(bytes<1048576) return (bytes/1024).toFixed(1)+" KB"
if(bytes<1073741824) return (bytes/1048576).toFixed(1)+" MB"

return (bytes/1073741824).toFixed(1)+" GB"

}
