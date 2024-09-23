#!/usr/bin/env bash
openssl req -newkey rsa:2048 -nodes -keyout /tmp/key.pem -subj "/C=CN/ST=GD/L=SZ/O=Acme, Inc./CN=localhost" -out /tmp/cert.csr
openssl x509 -req -extfile <(printf "subjectAltName=DNS:localhost,DNS:www.localhost") -days 3650 -in /tmp/cert.csr -CA /tmp/ca.crt -CAkey /tmp/ca.key -CAcreateserial -out /tmp/cert.pem

echo ""
echo Key path: /tmp/key.pem
echo Signed path: /tmp/cert.pem