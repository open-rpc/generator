#!/bin/bash

BLUE="\033[0;34m"
RED="\033[0;31m"
NC="\033[0m" # No Color
defaultPackageName="@etclabscore\/pristine-typescript-gatsby-react-material-ui"
defaultSiteTitle="Pristine"
defaultPathPrefix="typescript-gatsby-react-material-ui"

echo ""
echo "💎  Welcome Pristine Typescript Gatsby MaterialUI Post-Install setup! 💎"
echo ""
echo ""

echo -e "${BLUE}Enter the Package Name that will be used for the package.json:${NC}"

read packageName

echo ""

echo -e "${BLUE}Enter the Site Title that will be used for the gatsby-config.js:${NC}"

read siteTitle

echo ""

echo -e "${BLUE}Enter the Path Prefix that will be used for the gatsby-config.js (this is used for github pages deploy, usually the repo slug ex: pristine-typescript-react-gatsby-material-ui):${NC}"

read pathPrefix

echo ""

function replaceTextInFile() {
  # using ~ in place of / to avoid slashes in package names conflicting with sed
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i  "" -e "s~$1~$2~g" $3
  else
    sed -i  -e "s~$1~$2~g" $3
  fi
}

replaceTextInFile $defaultPackageName $packageName package.json
replaceTextInFile $defaultSiteTitle $siteTitle gatsby-config.js
replaceTextInFile $defaultPathPrefix $pathPrefix gatsby-config.js

echo -e "${BLUE} 🚀  Project Setup Completed. 🚀"

echo ""
