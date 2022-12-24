#!/usr/bin/env bash
set -eou pipefail

docker exec blue-green-loadbalancer sh -c "\
  echo set weight webapp\/green 100 | socat stdio /var/run/haproxy.sock; \
  echo set weight webapp\/blue    0 | socat stdio /var/run/haproxy.sock; \
"
