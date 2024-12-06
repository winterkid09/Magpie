#!/bin/bash

cd ..
python3 -m venv .venv
. .venv/bin/activate

npm install
npm run build

pip install -r requirements-no-ndi.txt

cd scripts