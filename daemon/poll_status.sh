#!/bin/sh

if [ -f /tmp/daemon.lock ];
then
   cat /tmp/daemon.lock
else
   echo "DOWN"
fi