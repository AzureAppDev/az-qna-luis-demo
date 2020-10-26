RESOURCE_GROUP=$1
APP_SERVICE=$2
IMAGE_WITH_TAG=$3
ACR_URL=$4
ACR_USERNAME=$5
ACR_PRIMARY_PASS=$6

az webapp config container set \
    --name $RESOURCE_GROUP \
    --resource-group $APP_SERVICE \
    --docker-custom-image-name $IMAGE_WITH_TAG \
    --docker-registry-server-url $ACR_URL \
    --docker-registry-server-user $ACR_USERNAME \
    --docker-registry-server-password $ACR_PRIMARY_PASS

az webapp restart `
    --name $APP_SERVICE `
    --resource-group $RESOURCE_GROUP