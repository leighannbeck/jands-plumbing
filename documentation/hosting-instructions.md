# PWP Hosting Setup Codealong
## Create a new project and droplet on Digital Ocean
- Create project - New Project in sidebar
    - projects are a way of organizing droplets
    - names and descriptions should be relevant for you, e.g. gkephart-bootcamp
- Create -> Droplet
    - OS -> Ubuntu -> version 24.04 LTS
    - Basic plan
    - $6 per month
    - San Francisco 6
    - IPv6 and Monitoring
    - New SSH Key (copy/paste your ssh key from your computer)
        - Mac/Linux key location: ~/.ssh/id_ed25519.pub
        - Windows key location: PuTTYgen
    - Choose hostname (internal to docker, e.g. username-pwp)
    - backups are strongly encouraged
    - Wait for process to finish
    - Copy the IP address for later
## Point domain to Digital Ocean and set up the DNS
- the instructions for this depend on where you bought your domain. I recommend using Digital Ocean's documentation for configuring name servers
    - [documentation](https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars)
## Set up DNS records on Digital Ocean
- Go to Create -> Domains/DNS
- Add domain
    - Enter your domain name
    - Click Add Domain
- Add A record for bare domain
    - Enter @ for hostname
    - Enter your droplet's IP address
    - Click Create Record
- Add A record for www subdomain
    - Enter www for hostname
    - Enter your droplet's IP address
    - Click Create Record
## Disable root ssh access
- we do this for security
    - root ssh access means that if login is compromised, entire server is compromised
    - better way: ssh in as a different user, then use sudo to run commands as root
    - means that if attacker gets our key, they don't have full access unless they ALSO get our password
- ssh into the server
    - For Mac and Linux: `ssh root@jandsplumbingheating.com`
    - For Windows: Set up a new PuTTY session
        - **Session**
            - Hostname: droplet ipv4 address
            - name `pwp`
            - Click `Save`
        - **Connection → Data**
            - Auto-login Username: root
        - **Connection → SSH → Auth**
            - Private key file for authentication: *Browse to the ssh-key.ppk file in your bootcamp directory*
        - **Session**
            - Click pwp
            - Click Save
- create user
    - `useradd -m -s /bin/bash -g users -G sudo lwalker32`
    - replace lwalker32 with your own
- create password
    - `passwd lwalker32`
- Move .ssh key file
    - `cp -r .ssh /home/lwalker32`
- change ownership of the .ssh directory
    - `cd /home/lwalker32`
    - `chown -R lwalker32:users .ssh/`


- Test Changes
    - `exit`
    - Mac/Linux: `ssh lwalker32@jandsplumbingheating.com`
    - Windows:
        - **Session**
            - Click pwp
            - Click Load
        - **Connection → Data**
            - Auto-login Username: change from root to username
        - **Session**
            - Click pwp
            - Click Save
-  **if successful**, delete the root user
    - Don't do this while logged in as root!
    - `sudo rm -rf /root/.ssh`
## Update Droplet
- update the apt repository list
    - `sudo apt update`
- upgrade packages
    - `sudo apt dist-upgrade`
    - You may be asked to overwrite some files. Type `n` and press enter to accept the defaults.
- reboot
    - `sudo reboot`
- ssh back in
- `ssh lwalker32@jandsplumbingheating.com`
## Install nginx and configure firewall using UFW
- install nginx
    - `sudo apt install nginx`
- add nginx to firewall
    - `sudo ufw allow 'Nginx HTTP'`
    - `sudo ufw allow 'Nginx HTTPS'`
    - `sudo ufw allow "OpenSSH"`
    - `sudo ufw enable`
    - `sudo ufw status`
- check nginx is running and active using systemctl
    - `systemctl status nginx`
    - you can also check to see if nginx is running by visiting the ip address/domain in your browser.
## Add nginx block for your domain
- create a directory for your deployment
    - `sudo mkdir -p /var/www/jandsplumbingheating.com/html`
- fix permissions
    - `sudo chown -R $USER:users /var/www/jandsplumbingheating.com/html`
    - create a deployment in Webstorm and upload it to the server


## create a new nginx block
- Create a new nginx block for your domain in the sites-available directory
- `sudo vim /etc/nginx/sites-available/jandsplumbingheating.com`
- add the following file
    - - replace your domain with your domain.com
-
```
server {
    listen 80;
    listen [::]:80;

    root /var/www/jandsplumbingheating.com/html;
    index index.html index.htm index.nginx-debian.html;

    server_name jandsplumbingheating.com www.jandsplumbingheating.com;

    location / {
            try_files $uri $uri/ =404;
    }
}   
```

- create a symlink to the sites-enabled directory
    - `sudo ln -s /etc/nginx/sites-available/jandsplumbingheating.com /etc/nginx/sites-enabled/`
    - Nginx uses symlinks to enable and disable sites in the sites-enabled directory.
    - This allows for developers to have multiple sites available, but only enable the ones you want to use.
- increase the server names hash bucket size
    - `sudo vim /etc/nginx/nginx.conf`
    - comment out following line in the http block
        - `server_names_hash_bucket_size 64;`
- Test nginx configuration
    - `sudo nginx -t`
    - if you get an error, check your nginx config file for typos
- restart nginx to apply changes
    - `sudo systemctl restart nginx`
    - visit your domain in your browser
## Install Certbot
- Certbot is a tool that allows us to get a free SSL certificate from Let's Encrypt
- Make sure an older version of certbot is not installed
    - `sudo apt remove certbot`
- install certbot using snap
    - `sudo snap install --classic certbot`
    - Make sure the certbot command is available
        - `sudo ln -s /snap/bin/certbot /usr/bin/certbot`
- run certbot to get a certificate
    - `sudo certbot --nginx`
    - enter your email address
    - agree to the terms of service
    - select the domain you want to get a certificate for
    - select option 2 to redirect all traffic to https
    - test your site in the browser
- Test auto renewal
- `sudo certbot renew --dry-run`
## Setup Deployment Pipeline using Github Actions
- Create a new ssh key on your server in the .ssh directory
    - `ssh-keygen -t ed25519 -C  "github Deploy Key" -f /home/lwalker32/.ssh/github_deploy_key`
    - Don't enter a passphrase
        - hit enter twice
- Copy the public key into your authorized keys file
    - `cat /home/lwalker32/.ssh/github_deploy_key.pub >> /home/lwalker32/.ssh/authorized_keys`
    - this command appends the public key to the authorized keys file using the cat command and the >> operator
    - `>>` appends the output of the left side of the command into the file on the right side of the command
- Copy the private key to your clipboard **(this is a very dangerous operation do not share this key with anyone )**
    - If the key is leaked delete it immediately and create a new one.
    - `cat /home/lwalker32/.ssh/github_deploy_key`
- Add the private key to your repository as a github secret(Github Secrets are encrypted environment variables that you can use in your github actions)
    - Go to your repository on github
    - Click on settings
    - Click on secrets -> actions
    - Click on new repository secret
    - Name the secret `PRIVATE_KEY`
    - Paste the private key into the value field
    - Click add secret
- Create a new github action in your repository
    - Create a new directory in your repository called `.github`
    - Create a new directory in the `.github` directory called `workflows`
    - Create a new file in the `workflows` directory called `deploy.yml`
    - Add the following code to the `deploy.yml` file
```yaml
name: Deploy via SSH
'on':
  - push
  - repository_dispatch
permissions:
  actions: read
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      # Make sure the @v0.9.0 matches the current version of the action
      - uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.PRIVATE_KEY }}

      - name: Install dependencies
        run: npm install

      - name: Build Vite site
        run: npm run build

      - name: Deploy to server
        run: |
         ssh-keyscan -H jandsplumbingheating.com >> ~/.ssh/known_hosts 
         scp -r ./dist/* lwalker32@jandsplumbingheating.com:/var/www/jandsplumbingheating.com/html
```
- Push your changes to github to trigger the action and test deploying your site




## Nginx Documentation
- [nginx documentation used](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04#step-5-setting-up-server-blocks-recommended)
- [Certbot documentation used](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal)