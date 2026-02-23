const client = new WebTorrent()

const list = document.getElementById("torrentList")
const magnetInput = document.getElementById("magnetInput")

const downSpeed = document.getElementById("downSpeed")
const peerCount = document.getElementById("peerCount")
const torrentCount = document.getElementById("torrentCount")

let saved = JSON.parse(localStorage.getItem("torrents") || "[]")

saved.forEach(addTorrent)

/* Add magnet */

document.getElementById("addBtn").onclick = () => {

const magnet = magnetInput.value.trim()

if(!magnet) return

save(magnet)
addTorrent(magnet)

magnetInput.value=""

}

/* Upload */

document.getElementById("torrentFile").addEventListener("change", e=>{
addTorrent(e.target.files[0])
})

/* Drag drop */

const drop = document.getElementById("dropZone")

drop.ondragover = e=>e.preventDefault()

drop.ondrop = e=>{
e.preventDefault()

const file = e.dataTransfer.files[0]

if(file) addTorrent(file)
}

/* Save */

function save(m){

saved.push(m)
localStorage.setItem("torrents",JSON.stringify(saved))

}

/* Torrent */

function addTorrent(source){

const el = document.createElement("div")
el.className="torrent"

el.innerHTML=`

<div class="top">
<div class="title">Loading...</div>
<div class="health"></div>
</div>

<div class="progressWrap">
<div class="bar"></div>
</div>

<div class="stats"></div>

<div class="controls">
<button class="small pause">Pause</button>
<button class="small resume">Resume</button>
<button class="small remove">Remove</button>
</div>

<div class="files"></div>

`

list.appendChild(el)

const title = el.querySelector(".title")
const health = el.querySelector(".health")
const bar = el.querySelector(".bar")
const stats = el.querySelector(".stats")
const filesDiv = el.querySelector(".files")

client.add(source, torrent => {

title.textContent = torrent.name
torrentCount.textContent = client.torrents.length

/* files */

torrent.files.forEach(file=>{

const btn = document.createElement("button")
btn.className="fileBtn"
btn.textContent=file.name

btn.onclick=()=>{

file.getBlobURL((err,url)=>{
const a=document.createElement("a")
a.href=url
a.download=file.name
a.click()
})

}

filesDiv.appendChild(btn)

})

/* progress */

const interval = setInterval(()=>{

bar.style.width = (torrent.progress*100)+"%"

stats.textContent =
(torrent.progress*100).toFixed(1)+"% | "+
format(torrent.downloadSpeed)+"/s | "+
torrent.numPeers+" peers"

updateHealth(torrent,health)

if(torrent.progress===1) clearInterval(interval)

},500)

/* controls */

el.querySelector(".pause").onclick=()=>torrent.pause()
el.querySelector(".resume").onclick=()=>torrent.resume()

el.querySelector(".remove").onclick=()=>{
torrent.destroy()
el.remove()
}

})

}

/* health */

function updateHealth(torrent,el){

if(torrent.numPeers>10){
el.textContent="Healthy"
el.className="health-good"
}
else if(torrent.numPeers>2){
el.textContent="Medium"
el.className="health-ok"
}
else{
el.textContent="Low"
el.className="health-bad"
}

}

/* global stats */

setInterval(()=>{

let down=0
let peers=0

client.torrents.forEach(t=>{
down+=t.downloadSpeed
peers+=t.numPeers
})

downSpeed.textContent=format(down)+"/s"
peerCount.textContent=peers

},1000)

function format(bytes){

if(bytes<1024) return bytes+" B"
if(bytes<1048576) return (bytes/1024).toFixed(1)+" KB"
if(bytes<1073741824) return (bytes/1048576).toFixed(1)+" MB"

return (bytes/1073741824).toFixed(1)+" GB"

}
