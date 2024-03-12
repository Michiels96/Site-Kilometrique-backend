# ⚡️ SiteKilometrique - backend ⚡️

- [⚡️ SiteKilometrique - backend ⚡️](#️-sitekilometrique---backend-️)
  - [Setup](#setup)
  - [Development mode](#development-mode)
  - [Production mode](#production-mode)
    - [Production mode as system daemon](#production-mode-as-system-daemon)
  - [Further info](#further-info)

## Setup

Install dependencies :

*\# npm i*

Create needed repositories:

*\# mkdir {fichiers, logs}*

Untar protected *launch_scripts.tar* file with a *know password* :

*\# openssl enc -d -aes-256-cbc -in launch_scripts.tar | tar xvf -*

Tar it back :

*\# tar cvf - launch_scripts/ | openssl enc -aes-256-cbc -e -salt -out launch_scripts.tar*

## Development mode

Copy .env & launch_script_development.sh files from the tar file to the root folder of this project and :

*\# bash launch_script_development.sh*

> verify if variables from .env are correct.

## Production mode

Copy launch_script_production.sh files from the tar file to the root folder of this project and :

*\# bash launch_script_production.sh*

> verify if variables from launch_script_production.sh are correct.

### Production mode as system daemon

Copy site_kilometrique_backend.service file to */usr/lib/systemd/user/.* and create a symbolic link to */etc/systemd/system/.* :

*\# ln -s /usr/lib/systemd/user/site_kilometrique_backend.service /etc/systemd/system/site_kilometrique_backend.service*

> verify if variables from site_kilometrique_backend.service are correct.

Enable the service for future reboots :

*\# systemctl enable site_kilometrique_backend.service*

## Further info

website : https://michiels.zapto.org

