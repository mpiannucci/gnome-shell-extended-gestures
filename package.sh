#!/bin/sh

if [ -f ./extendedgestures@mpiannucci.github.com.zip ] then
    rm -rf ./extendedgestures@mpiannucci.github.com.zip
fi

zip -r extendedgestures@mpiannucci.github.com.zip extendedgestures@mpiannucci.github.com
