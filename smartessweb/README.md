### NOTES
- There are 2 section. The first section will explain how to setup your environment when using for the first time. The second section will tell you about how to run web for development.
- The container used for development is different than container used for production/deployment.
      - The development container for website combines both frontend and backend together so we can run the code with just 1 command! 
      - The containers for deployment/production separates frontend and backend. This is because frontend is a static website (don't need a server) and backend needs a server (which costs $$).
      - Summary: Development uses 1 container. Production/deployment uses 2 containers and keep frontend and backend separated as proposed in feedback (by Professor Rigby) for release 1.



### One-time Instructions:

#### A. Setup Docker container (development) 

There is a security aspect which requires setting a .env file. This needs to be done only once initially. You will also need to setup a docker network for the first time. For running instructions just head over to the next section below.

1. Locate the smartessweb folder:

   ![image](https://github.com/user-attachments/assets/18494e02-1b17-4a34-beb2-f8c83e58d367)


2. Install create a .env file like the following:

   ![image](https://github.com/user-attachments/assets/359a96da-33f7-4f03-aac0-44b693c58855)


3. Paste the following code:

```bash
   SUPABASE_URL="URL"
   SUPABASE_ANON_KEY="KEY"
   RESEND_API_KEY="KEY"
   RESEND_DOMAIN ="DOMAIN"
   RESEND_EMAIL_TO ="YOUR EMAIL"
   PORT = 3000
   SERVER_URL=http://localhost:3000/api
```

4. DM Abdullah. He will provide you with the URL and key. For TAs and Prof, refer to the presentation slides. A link is shared to download this.

5. Replace the values accordingly.

6. In your code editor terminal go to the correct folder/directory. For reference, here is how mine looks:

   ```bash
     PS C:\Users\Abdullah\Desktop\Fall2024\SOEN490\Capstone\Smartess>
   ```

7. Make docker network called smartess_network:

   ```bash
      docker network create smartess_network
   ```

For any question DM Abdullah.

#### B. Setup Docker containers (deployment/production)

This section is designated to explain how to use docker commands for production deployment. The exact way varies from one cloud provider to another. Please refer to their documentation. 

You may will also have to setup the environment variables. Some providers allows direct insertion rather than .env files while other require .env files. Refer to their documentation. These environment variables will remain unchanged. You may use the same one as above with the different SERVER_URL.

##### Frontend hosting docker command: 

```bash
   docker-compose up --build smartessweb_prod_frontend
```

##### Backend hosting docker command: 
```bash
   docker-compose up --build smartessweb_prod_backend
```



### Running Instructions (development):


1. In your code editor terminal go to the correct folder/directory. For reference, here is how mine looks:

2. Type the following command and press enter:

   ```bash
      docker-compose up --build smartessweb_dev
   ```

   NOTES: 
      -Give some time to initially build it. Usually it should take 50s but wait 5 min (may depend on computer's hardware).

      -We are only running the smartess web from this command. We will be needing to run the whole docker compose file later in the project. The instructions will be updated accordingly. 


3. Open your broswer and type :

   ```bash
     http://localhost:3001/
   ```

   You should see the app will be lauched on this page:

   ![image](https://github.com/user-attachments/assets/ecb51ebd-34fe-412b-a0c4-436c7bf8bba5)

