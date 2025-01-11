# Raspberry Pi Hub Setup

## Install Raspberry Pi OS

1. **Download Raspberry Pi Imager**:
   - Go to the [Raspberry Pi Imager](https://www.raspberrypi.org/software/) and download the version appropriate for your operating system.

2. **Install Raspberry Pi OS**:
   - Open Raspberry Pi Imager.
   - install 32 bit image
   - Insert your SD card and select it in Raspberry Pi Imager.
   - When prompted to enter custom settings, chose edit
   - In General section:
     - Set hostname to raspberrypi.local
     - Set username and password (username used for rest of setup will be leobrodeur)
   - In Services sections:
     - Enbale SSH
   - Click **Write** to install Raspberry Pi OS onto the SD card.
   - IMPORTANT: ssh is not defaulted on flashed raspberry pi. To enable SSH on the Raspberry Pi, create a file named `ssh` (no extension) on the boot partition of the SD card. This enables SSH on boot.

## Configure Raspberry Pi

1. **Insert the SD card into the Raspberry Pi**:
   - After the installation is complete, insert the SD card and ethernet cable into your Raspberry Pi 4B.

2. **Power on the Raspberry Pi**:
   - Power up the Raspberry Pi. It will boot into the default Raspberry Pi OS.

## Connect to Raspberry Pi via SSH

2. **Connect to Raspberry Pi**:
   - Open a terminal on your laptop or desktop.
   - Use the following command to connect via SSH:
     ```bash
     ssh leobrodeur@raspberrypi.local
     ```
   - Enter password

## Install Docker

1. **Update the Package List**:
   - Run the following command to update your package list:
     ```bash
     sudo apt update
     ```

2. **Install Dependencies**:
   - Run the following command to install necessary dependencies:
     ```bash
     sudo apt install apt-transport-https ca-certificates curl software-properties-common
     ```

3. **Setup Docker**:
   - Run the following command to download Docker’s official GPG key:
     ```bash
      sudo apt-get update
      sudo apt-get install ca-certificates curl
      sudo install -m 0755 -d /etc/apt/keyrings
      sudo curl -fsSL https://download.docker.com/linux/raspbian/gpg -o /etc/apt/keyrings/docker.asc
      sudo chmod a+r /etc/apt/keyrings/docker.asc
      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/raspbian \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      sudo apt-get update
     ```

4. **Install Docker**:
   - Run the following command to install Docker:
     ```bash
     sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
     ```

## Allow Non-Root User to Run Docker Commands

1. **Add Current User to Docker Group**:
   - Run the following command to add your user to the Docker group:
     ```bash
     sudo groupadd docker
     sudo usermod -aG docker $USER
     ```

2. **Apply Changes**:
   - To apply these changes, log out and log back in, or use the following command to exit the current session:
     ```bash
     exit
     ```
   - Log back in to the Raspberry Pi.

## Install Docker Compose

1. **Install Docker Compose**:
   - Follow the [official Docker Compose installation instructions for Linux](https://docs.docker.com/compose/install/).
   - You can also watch a tutorial on YouTube: [Docker Compose Installation Guide](https://www.youtube.com/watch?v=Cvjc66-mkFo).

## Start Docker Compose

1. **Run Docker Compose**:
   - Run the following command to start your Docker Compose environment in detached mode:
     ```bash
     docker compose up -d
     ```

2. **Verify Docker Compose is Running**:
   - You can verify if the containers are running using:
     ```bash
     docker compose ps
     ```
### Smartess HUB installation
## Proper simplified bash scripts and HA settings pulled sirectly from repo to come