#!/bin/bash

echo "Criando as imagens ....."

docker build . --no-cache -t adventureandre/graos-frontend:1.0

echo "Realizando o push das imagens ....."

docker push adventureandre/graos-frontend:1.0

echo "Criando os servicos no cluster kubernetes ....."

kubectl apply -f ./services.yml

echo "Criando o deployment no cluster kubernetes ....."

kubectl apply -f ./graos-frontend:1.0.yml --record
