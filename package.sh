#!/bin/sh

if [ -f ./extendedgestures@mpiannucci.github.com.zip ]; then
    rm -rf ./extendedgestures@mpiannucci.github.com.zip
fi

cd extendedgestures@mpiannucci.github.com/
zip -r ../extendedgestures@mpiannucci.github.com.zip *
