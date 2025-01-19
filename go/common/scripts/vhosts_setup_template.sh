#!/bin/bash

## RabbitMQ host settings
#RABBITMQ_HOST=  # Adjust as necessary
#RABBITMQ_USER=
#RABBITMQ_PASS=

# Function to create a vhost and set up permissions
create_vhost_and_user() {
    VHOST_NAME=$1
    USER_NAME=$2
    PASSWORD=$3

    echo "Creating vhost $VHOST_NAME..."
    rabbitmqctl add_vhost $VHOST_NAME

    echo "Creating user $USER_NAME..."
    rabbitmqctl add_user $USER_NAME $PASSWORD

    echo "Setting permissions for user $USER_NAME on $VHOST_NAME..."
    rabbitmqctl set_permissions -p $VHOST_NAME $USER_NAME ".*" ".*" ".*"

    echo "Vhost $VHOST_NAME and user $USER_NAME created successfully."
}

# Read the environment parameter
# Usage: ./vhosts_setup.sh {test|dev|prod}

#ENVIRONMENT=$1
#
## Define vhosts and users based on the environment
#case $ENVIRONMENT in
#    test)
#        create_vhost_and_user "/test-env" "test_user" "test_password"
#        ;;
#    dev)
#        create_vhost_and_user "/dev-env" "dev_user" "dev_password"
#        ;;
#    prod)
#        create_vhost_and_user "/prod-env" "prod_user" "prod_password"
#        ;;
#    ha_v0)
#        create_vhost_and_user "/home-assistant-env0" "ha_v0_user" "ha_v0_password"
#    *)
#        echo "Usage: $0 {test|dev|prod}"
#        exit 1
#        ;;
#esac
