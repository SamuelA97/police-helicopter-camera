fx_version "bodacious"
game "gta5"

name "Binoculars"
description ""
author "Sam"

server_script "build/server/*.server.js"
client_script "build/client/*.client.js"

ui_page {
    "src/nui/dist/index.html"
}

files {
    "src/nui/dist/index.html",
    "src/nui/dist/assets/*.*"
}
