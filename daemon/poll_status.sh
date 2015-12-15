#!/bin/sh

if [ -f /tmp/core_server.lock ];
then
   echo "UP"
else
   echo "DOWN"
fi