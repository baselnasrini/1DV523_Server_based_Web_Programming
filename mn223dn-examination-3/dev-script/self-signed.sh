#!/bin/bash

echo "Generating self-signed certificates..."
mkdir -p ./config/sslcerts
openssl genrsa -out ./config/sslcerts/key.pem 4096
openssl req -new -key ./config/sslcerts/key.pem -out ./config/sslcerts/csr.pem
openssl x509 -req -days 365 -in ./config/sslcerts/csr.pem -signkey ./config/sslcerts/key.pem -out ./config/sslcerts/cert.pem
rm ./config/sslcerts/csr.pem
chmod 600 ./config/sslcerts/key.pem ./config/sslcerts/cert.pem