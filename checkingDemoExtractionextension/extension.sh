#!/usr/bin/env bash

#NOTE: if you are on macOS, update to bash v4 i.e brew install bash

# rm -rf extension extension.zip
# cp -r public extension 
mkdir extension
cd extension
 
declare -A scripts0=(
    [file]='external.js'
    [url]='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
)

declare -n scripts
for scripts  in ${!scripts@}; do
  curl ${scripts[url]} -o ${scripts[file]}
  sed -i"" -e "s|${scripts[url]}|${scripts[file]}|g" ../popup.html
done

# zip -r extension.zip *
# mv extension.zip ../