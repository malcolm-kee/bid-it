#!/bin/bash

set -e;

result="$(curl -s http://localhost:3000/deal)";

echo $result;

if [ "$result" == '[]' ]; then
	echo "empty deal, we will create some deals for testing...";
	yarn setup;
else
	echo "not empty, so we will not create more deal.";
fi

yarn simulate;

export DB_HOST="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' bid-it_db_1)";

yarn report;

