#!/bin/bash
git pull
zip -r lambda-function.zip .
sam deploy --guided