#!/usr/bin/env bash
openssl genrsa -out /tmp/ca.key 2048
openssl req -new -x509 -days 3650 -key /tmp/ca.key -subj "/C=CN/ST=GD/L=SZ/O=Acme, Inc./CN=Acme Root CA" -out /tmp/ca.crt

echo ""
echo CA key path: /tmp/ca.key
echo CA cert path: /tmp/ca.crt
