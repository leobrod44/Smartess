#!/bin/sh

if [ -f go.work ]; then
  go work vendor
else
  go mod vendor
fi